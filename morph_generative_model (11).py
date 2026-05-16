"""
MORPH GENERATIVE MODEL v1.0
Based on GenerativeLSTM Research (AdaptiveBProcess)
Integrated into Morph OS Ecosystem

Key improvements over baseline:
- Separate categorical/continuous input streams with embeddings
- Log-normalization for temporal features
- Case context encoder (birth signature persistence)
- Bi-LSTM shared encoder
- Multi-task output heads (7 simultaneous predictions)
- Iterative generation with feedback loop
- Random choice vs arg-max sampling (perspective-relative determinism)

Author: Morph OS / Synthia Integration
"""

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
from typing import Dict, List, Optional, Tuple
import json


# ============================================================
# CONFIGURATION
# ============================================================

class MorphConfig:
    """Configuration matching the 64-codon / hexagram dimensional system"""

    # Categorical vocabularies
    NUM_HEXAGRAMS = 64
    NUM_GATES = 64
    NUM_LINES = 6
    NUM_COLORS = 6
    NUM_TONES = 6
    NUM_BASES = 5
    NUM_DIMENSIONS = 3          # Body, Mind, Heart
    NUM_ZODIAC = 12
    NUM_HOUSES = 12

    # Embedding dimensions
    EMBED_DIM = 32

    # Continuous features: degrees, minutes, seconds, arcseconds, 
    # timestamp, resonance_freq, orbital_period, confidence
    NUM_CONTINUOUS = 8

    # Model architecture
    SEQUENCE_LENGTH = 7         # N-gram window
    HIDDEN_DIM = 256
    NUM_LAYERS = 2
    DROPOUT = 0.2

    # Case context (personal signature)
    CASE_CONTEXT_DIM = 64

    # Sampling
    TEMPERATURE = 1.0


# ============================================================
# EMBEDDING LAYERS
# ============================================================

class MorphEmbeddings(nn.Module):
    """
    Converts all categorical features into learned dense vectors.
    Each hexagram, gate, line, etc. gets a learned vector in latent space.
    Co-occurring values become geometrically close.
    """
    def __init__(self, config: MorphConfig):
        super().__init__()
        self.config = config

        self.hexagram_embed = nn.Embedding(config.NUM_HEXAGRAMS, config.EMBED_DIM)
        self.gate_embed = nn.Embedding(config.NUM_GATES, config.EMBED_DIM)
        self.line_embed = nn.Embedding(config.NUM_LINES, config.EMBED_DIM)
        self.color_embed = nn.Embedding(config.NUM_COLORS, config.EMBED_DIM)
        self.tone_embed = nn.Embedding(config.NUM_TONES, config.EMBED_DIM)
        self.base_embed = nn.Embedding(config.NUM_BASES, config.EMBED_DIM)
        self.dimension_embed = nn.Embedding(config.NUM_DIMENSIONS, config.EMBED_DIM)
        self.zodiac_embed = nn.Embedding(config.NUM_ZODIAC, config.EMBED_DIM)
        self.house_embed = nn.Embedding(config.NUM_HOUSES, config.EMBED_DIM)

        self.total_cat_dim = config.EMBED_DIM * 9

    def forward(self, categorical_batch: Dict[str, torch.Tensor]) -> torch.Tensor:
        embeddings = [
            self.hexagram_embed(categorical_batch['hexagram']),
            self.gate_embed(categorical_batch['gate']),
            self.line_embed(categorical_batch['line']),
            self.color_embed(categorical_batch['color']),
            self.tone_embed(categorical_batch['tone']),
            self.base_embed(categorical_batch['base']),
            self.dimension_embed(categorical_batch['dimension']),
            self.zodiac_embed(categorical_batch['zodiac']),
            self.house_embed(categorical_batch['house']),
        ]
        return torch.cat(embeddings, dim=-1)


# ============================================================
# CONTINUOUS PROCESSOR
# ============================================================

class ContinuousProcessor(nn.Module):
    """
    Log-normalization for high-variability temporal features.
    Z-score scaling with learnable parameters.
    """
    def __init__(self, config: MorphConfig):
        super().__init__()
        self.config = config
        self.log_features = [4, 5, 6]  # timestamp, resonance_freq, orbital_period
        self.scale_mean = nn.Parameter(torch.zeros(config.NUM_CONTINUOUS))
        self.scale_std = nn.Parameter(torch.ones(config.NUM_CONTINUOUS))

    def forward(self, continuous_batch: torch.Tensor) -> torch.Tensor:
        x = continuous_batch.clone()
        for idx in self.log_features:
            x[:, :, idx] = torch.log(x[:, :, idx] + 1.0)
        x = (x - self.scale_mean) / (self.scale_std + 1e-8)
        return x


# ============================================================
# CASE CONTEXT ENCODER
# ============================================================

class CaseContextEncoder(nn.Module):
    """
    Encodes a person's birth chart into a persistent 64-dim vector.
    This vector is concatenated to every timestep.
    """
    def __init__(self, config: MorphConfig, embeddings: MorphEmbeddings):
        super().__init__()
        self.compressor = nn.Sequential(
            nn.Linear(embeddings.total_cat_dim + config.NUM_CONTINUOUS, 128),
            nn.ReLU(),
            nn.Dropout(config.DROPOUT),
            nn.Linear(128, config.CASE_CONTEXT_DIM)
        )
        self.embeddings = embeddings

    def forward(self, birth_categorical: Dict[str, torch.Tensor], 
                birth_continuous: torch.Tensor) -> torch.Tensor:
        cat_emb = self.embeddings(birth_categorical).squeeze(1)
        combined = torch.cat([cat_emb, birth_continuous], dim=-1)
        return self.compressor(combined)


# ============================================================
# MAIN GENERATIVE MODEL
# ============================================================

class MorphGenerativeModel(nn.Module):
    """
    Complete multi-task generative model.

    Inputs:
        - categorical_seq: Dict of [batch, seq_len] tensors
        - continuous_seq: [batch, seq_len, NUM_CONTINUOUS]
        - birth_cat: Dict of [batch, 1] birth values
        - birth_cont: [batch, NUM_CONTINUOUS]

    Outputs (7 heads):
        - hexagram_probs: [batch, 64]
        - gate_probs: [batch, 64]
        - line_probs: [batch, 6]
        - dimension_probs: [batch, 3]
        - magnitude: [batch, 1] (0-1)
        - time_offset: [batch, 1] (log-normalized)
        - confidence: [batch, 1] (0-1)
    """
    def __init__(self, config: MorphConfig):
        super().__init__()
        self.config = config

        self.embeddings = MorphEmbeddings(config)
        self.continuous = ContinuousProcessor(config)
        self.case_context = CaseContextEncoder(config, self.embeddings)

        self.input_dim = self.embeddings.total_cat_dim + config.NUM_CONTINUOUS + config.CASE_CONTEXT_DIM

        self.lstm = nn.LSTM(
            input_size=self.input_dim,
            hidden_size=config.HIDDEN_DIM,
            num_layers=config.NUM_LAYERS,
            batch_first=True,
            dropout=config.DROPOUT if config.NUM_LAYERS > 1 else 0,
            bidirectional=True
        )

        lstm_out_dim = config.HIDDEN_DIM * 2

        self.shared_dense = nn.Sequential(
            nn.Linear(lstm_out_dim, 256),
            nn.ReLU(),
            nn.Dropout(config.DROPOUT)
        )

        # Multi-task heads
        self.hexagram_head = nn.Sequential(nn.Linear(256, 128), nn.ReLU(), nn.Linear(128, config.NUM_HEXAGRAMS))
        self.gate_head = nn.Sequential(nn.Linear(256, 128), nn.ReLU(), nn.Linear(128, config.NUM_GATES))
        self.line_head = nn.Sequential(nn.Linear(256, 64), nn.ReLU(), nn.Linear(64, config.NUM_LINES))
        self.dimension_head = nn.Sequential(nn.Linear(256, 64), nn.ReLU(), nn.Linear(64, config.NUM_DIMENSIONS))
        self.magnitude_head = nn.Sequential(nn.Linear(256, 64), nn.ReLU(), nn.Linear(64, 1), nn.Sigmoid())
        self.time_head = nn.Sequential(nn.Linear(256, 64), nn.ReLU(), nn.Linear(64, 1))
        self.confidence_head = nn.Sequential(nn.Linear(256, 64), nn.ReLU(), nn.Linear(64, 1), nn.Sigmoid())

    def forward(self, categorical_seq: Dict[str, torch.Tensor], 
                continuous_seq: torch.Tensor,
                birth_cat: Dict[str, torch.Tensor], 
                birth_cont: torch.Tensor,
                temperature: float = 1.0) -> Dict[str, torch.Tensor]:

        batch_size, seq_len = continuous_seq.shape[0], continuous_seq.shape[1]

        cat_emb = self.embeddings(categorical_seq)
        cont_proc = self.continuous(continuous_seq)
        context = self.case_context(birth_cat, birth_cont)
        context = context.unsqueeze(1).expand(-1, seq_len, -1)

        combined = torch.cat([cat_emb, cont_proc, context], dim=-1)
        lstm_out, _ = self.lstm(combined)
        last_out = lstm_out[:, -1, :]
        shared = self.shared_dense(last_out)

        outputs = {}
        outputs['hexagram_logits'] = self.hexagram_head(shared)
        outputs['hexagram_probs'] = F.softmax(outputs['hexagram_logits'] / temperature, dim=-1)

        outputs['gate_logits'] = self.gate_head(shared)
        outputs['gate_probs'] = F.softmax(outputs['gate_logits'] / temperature, dim=-1)

        outputs['line_logits'] = self.line_head(shared)
        outputs['line_probs'] = F.softmax(outputs['line_logits'] / temperature, dim=-1)

        outputs['dimension_logits'] = self.dimension_head(shared)
        outputs['dimension_probs'] = F.softmax(outputs['dimension_logits'] / temperature, dim=-1)

        outputs['magnitude'] = self.magnitude_head(shared)
        outputs['time_offset'] = self.time_head(shared)
        outputs['confidence'] = self.confidence_head(shared)

        return outputs

    def sample_next_state(self, categorical_seq: Dict[str, torch.Tensor],
                          continuous_seq: torch.Tensor,
                          birth_cat: Dict[str, torch.Tensor],
                          birth_cont: torch.Tensor,
                          temperature: float = 1.0,
                          method: str = 'random_choice') -> Dict:
        """
        Sample next state from model predictions.

        method='random_choice': Sample from probability distribution
        method='arg_max': Always pick highest probability
        """
        self.eval()
        with torch.no_grad():
            outputs = self.forward(categorical_seq, continuous_seq, birth_cat, birth_cont, temperature)

            results = {}

            def sample_or_max(probs, num_classes, method):
                if method == 'random_choice':
                    p = probs.cpu().numpy()[0]
                    return int(np.random.choice(num_classes, p=p))
                return int(torch.argmax(probs, dim=-1).item())

            results['hexagram'] = sample_or_max(outputs['hexagram_probs'], self.config.NUM_HEXAGRAMS, method)
            results['gate'] = sample_or_max(outputs['gate_probs'], self.config.NUM_GATES, method)
            results['line'] = sample_or_max(outputs['line_probs'], self.config.NUM_LINES, method)
            results['dimension'] = sample_or_max(outputs['dimension_probs'], self.config.NUM_DIMENSIONS, method)
            results['magnitude'] = float(outputs['magnitude'].item())
            results['time_offset'] = float(outputs['time_offset'].item())
            results['confidence'] = float(outputs['confidence'].item())

            # Include full probability distributions for analysis
            results['hexagram_distribution'] = outputs['hexagram_probs'].cpu().numpy()[0].tolist()
            results['gate_distribution'] = outputs['gate_probs'].cpu().numpy()[0].tolist()
            results['dimension_distribution'] = outputs['dimension_probs'].cpu().numpy()[0].tolist()

            return results


# ============================================================
# SEQUENCE GENERATOR
# ============================================================

class MorphSequenceGenerator:
    """
    Iterative sequence generation with feedback loop.
    Predictions are fed back as inputs for the next step.
    """
    def __init__(self, model: MorphGenerativeModel, config: MorphConfig):
        self.model = model
        self.config = config

    def generate(self, birth_cat: Dict[str, torch.Tensor], 
                 birth_cont: torch.Tensor,
                 prefix_cat: Optional[Dict[str, torch.Tensor]] = None,
                 prefix_cont: Optional[torch.Tensor] = None,
                 max_length: int = 50,
                 temperature: float = 1.0,
                 method: str = 'random_choice',
                 stop_on_hexagram: Optional[int] = None) -> List[Dict]:
        """
        Generate complete sequence from prefix or scratch.
        """
        device = next(self.model.parameters()).device

        if prefix_cat is not None and prefix_cont is not None:
            seq_cat = {k: v.clone() for k, v in prefix_cat.items()}
            seq_cont = prefix_cont.clone()
        else:
            seq_cat = {
                'hexagram': torch.zeros(1, 1, dtype=torch.long, device=device),
                'gate': torch.zeros(1, 1, dtype=torch.long, device=device),
                'line': torch.zeros(1, 1, dtype=torch.long, device=device),
                'color': torch.zeros(1, 1, dtype=torch.long, device=device),
                'tone': torch.zeros(1, 1, dtype=torch.long, device=device),
                'base': torch.zeros(1, 1, dtype=torch.long, device=device),
                'dimension': torch.zeros(1, 1, dtype=torch.long, device=device),
                'zodiac': torch.zeros(1, 1, dtype=torch.long, device=device),
                'house': torch.zeros(1, 1, dtype=torch.long, device=device),
            }
            seq_cont = torch.zeros(1, 1, self.config.NUM_CONTINUOUS, device=device)

        generated = []

        for step in range(max_length):
            if seq_cont.shape[1] > self.config.SEQUENCE_LENGTH:
                seq_cat = {k: v[:, -self.config.SEQUENCE_LENGTH:] for k, v in seq_cat.items()}
                seq_cont = seq_cont[:, -self.config.SEQUENCE_LENGTH:]

            next_state = self.model.sample_next_state(
                seq_cat, seq_cont, birth_cat, birth_cont,
                temperature=temperature, method=method
            )

            generated.append(next_state)

            if stop_on_hexagram is not None and next_state['hexagram'] == stop_on_hexagram:
                break

            # Feedback loop: append prediction to sequence
            new_hex = torch.tensor([[next_state['hexagram']]], device=device, dtype=torch.long)
            new_gate = torch.tensor([[next_state['gate']]], device=device, dtype=torch.long)
            new_line = torch.tensor([[next_state['line']]], device=device, dtype=torch.long)

            seq_cat['hexagram'] = torch.cat([seq_cat['hexagram'], new_hex], dim=1)
            seq_cat['gate'] = torch.cat([seq_cat['gate'], new_gate], dim=1)
            seq_cat['line'] = torch.cat([seq_cat['line'], new_line], dim=1)

            for key in ['color', 'tone', 'base', 'dimension', 'zodiac', 'house']:
                last_val = seq_cat[key][:, -1:]
                seq_cat[key] = torch.cat([seq_cat[key], last_val], dim=1)

            new_cont = torch.zeros(1, 1, self.config.NUM_CONTINUOUS, device=device)
            new_cont[0, 0, 0] = next_state['magnitude']
            seq_cont = torch.cat([seq_cont, new_cont], dim=1)

        return generated


# ============================================================
# DATASET
# ============================================================

class MorphTraceDataset(Dataset):
    """
    Dataset for training on human dimensional traces.
    Sliding window approach with multi-task targets.
    """
    def __init__(self, traces: List[Dict], config: MorphConfig, window_size: Optional[int] = None):
        self.config = config
        self.window = window_size or config.SEQUENCE_LENGTH
        self.samples = []

        for trace in traces:
            cat = trace['categorical']
            cont = trace['continuous']
            birth_cat = trace['birth_categorical']
            birth_cont = trace['birth_continuous']
            trace_len = len(cat['hexagram'])

            for i in range(trace_len - self.window):
                window_cat = {k: v[i:i+self.window] for k, v in cat.items()}
                window_cont = cont[i:i+self.window]

                target = {
                    'hexagram': cat['hexagram'][i + self.window],
                    'gate': cat['gate'][i + self.window],
                    'line': cat['line'][i + self.window],
                    'dimension': cat['dimension'][i + self.window],
                    'magnitude': cont[i + self.window, 0],
                    'time_offset': cont[i + self.window, 4],
                }

                self.samples.append({
                    'window_cat': window_cat,
                    'window_cont': window_cont,
                    'birth_cat': birth_cat,
                    'birth_cont': birth_cont,
                    'target': target
                })

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        s = self.samples[idx]

        window_cat = {k: torch.tensor(v, dtype=torch.long) for k, v in s['window_cat'].items()}
        window_cont = torch.tensor(s['window_cont'], dtype=torch.float32)
        birth_cat = {k: torch.tensor([v], dtype=torch.long) for k, v in s['birth_cat'].items()}
        birth_cont = torch.tensor(s['birth_cont'], dtype=torch.float32)

        target = {
            'hexagram': torch.tensor(s['target']['hexagram'], dtype=torch.long),
            'gate': torch.tensor(s['target']['gate'], dtype=torch.long),
            'line': torch.tensor(s['target']['line'], dtype=torch.long),
            'dimension': torch.tensor(s['target']['dimension'], dtype=torch.long),
            'magnitude': torch.tensor(s['target']['magnitude'], dtype=torch.float32),
            'time_offset': torch.tensor(s['target']['time_offset'], dtype=torch.float32),
        }

        return window_cat, window_cont, birth_cat, birth_cont, target


# ============================================================
# TRAINING
# ============================================================

def train_morph_model(model: MorphGenerativeModel, 
                      dataloader: DataLoader,
                      epochs: int = 50,
                      lr: float = 0.001,
                      device: str = 'cpu',
                      loss_weights: Optional[Dict[str, float]] = None) -> MorphGenerativeModel:
    """
    Training loop with weighted multi-task losses.
    """
    if loss_weights is None:
        loss_weights = {
            'hexagram': 1.0,
            'gate': 0.8,
            'line': 0.6,
            'dimension': 0.7,
            'magnitude': 0.5,
            'time_offset': 0.4
        }

    model = model.to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    ce_loss = nn.CrossEntropyLoss()
    mse_loss = nn.MSELoss()

    for epoch in range(epochs):
        model.train()
        total_loss = 0

        for batch in dataloader:
            window_cat, window_cont, birth_cat, birth_cont, target = batch

            window_cat = {k: v.to(device) for k, v in window_cat.items()}
            window_cont = window_cont.to(device)
            birth_cat = {k: v.to(device) for k, v in birth_cat.items()}
            birth_cont = birth_cont.to(device)

            outputs = model(window_cat, window_cont, birth_cat, birth_cont)

            loss = (
                loss_weights['hexagram'] * ce_loss(outputs['hexagram_logits'], target['hexagram'].to(device)) +
                loss_weights['gate'] * ce_loss(outputs['gate_logits'], target['gate'].to(device)) +
                loss_weights['line'] * ce_loss(outputs['line_logits'], target['line'].to(device)) +
                loss_weights['dimension'] * ce_loss(outputs['dimension_logits'], target['dimension'].to(device)) +
                loss_weights['magnitude'] * mse_loss(outputs['magnitude'].squeeze(), target['magnitude'].to(device)) +
                loss_weights['time_offset'] * mse_loss(outputs['time_offset'].squeeze(), target['time_offset'].to(device))
            )

            optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()

            total_loss += loss.item()

        avg_loss = total_loss / len(dataloader)
        if epoch % 10 == 0:
            print(f"Epoch {epoch}: Loss = {avg_loss:.4f}")

    return model


# ============================================================
# EXPORT / IMPORT
# ============================================================

def export_model(model: MorphGenerativeModel, path: str, metadata: Optional[Dict] = None):
    """Save model weights and config."""
    checkpoint = {
        'state_dict': model.state_dict(),
        'config': model.config.__dict__,
        'metadata': metadata or {}
    }
    torch.save(checkpoint, path)
    print(f"Model exported to {path}")

def import_model(path: str, device: str = 'cpu') -> Tuple[MorphGenerativeModel, Dict]:
    """Load model weights and config."""
    checkpoint = torch.load(path, map_location=device)
    config = MorphConfig()
    for k, v in checkpoint['config'].items():
        setattr(config, k, v)
    model = MorphGenerativeModel(config)
    model.load_state_dict(checkpoint['state_dict'])
    model = model.to(device)
    return model, checkpoint.get('metadata', {})


# ============================================================
# EXAMPLE USAGE
# ============================================================

if __name__ == "__main__":
    print("Morph Generative Model v1.0")
    print("=" * 50)

    config = MorphConfig()
    model = MorphGenerativeModel(config)

    total_params = sum(p.numel() for p in model.parameters())
    print(f"Parameters: {total_params:,}")
    print(f"Architecture: 2-layer Bi-LSTM, {config.HIDDEN_DIM} hidden, 7 output heads")

    # Example birth signature
    birth_cat = {
        'hexagram': torch.tensor([[1]], dtype=torch.long),
        'gate': torch.tensor([[10]], dtype=torch.long),
        'line': torch.tensor([[3]], dtype=torch.long),
        'color': torch.tensor([[2]], dtype=torch.long),
        'tone': torch.tensor([[4]], dtype=torch.long),
        'base': torch.tensor([[1]], dtype=torch.long),
        'dimension': torch.tensor([[0]], dtype=torch.long),
        'zodiac': torch.tensor([[5]], dtype=torch.long),
        'house': torch.tensor([[1]], dtype=torch.long),
    }
    birth_cont = torch.zeros(1, config.NUM_CONTINUOUS)

    # Generate
    generator = MorphSequenceGenerator(model, config)
    sequence = generator.generate(birth_cat, birth_cont, max_length=5)

    print("\nGenerated sequence:")
    for i, state in enumerate(sequence):
        dims = ['Body', 'Mind', 'Heart']
        print(f"  {i+1}. Hex {state['hexagram']:2d} | Gate {state['gate']:2d} | "
              f"Line {state['line']+1} | {dims[state['dimension']]} | "
              f"Conf {state['confidence']:.2f}")
