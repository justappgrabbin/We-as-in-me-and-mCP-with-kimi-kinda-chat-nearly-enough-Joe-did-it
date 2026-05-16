import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import useOSStore from '../../store/useOSStore';
import { GATE_WORDS, INTENT_GATES } from '../../types/os';

export default function ChatApp() {
  const chatHistory = useOSStore((s) => s.chatHistory);
  const addChatMessage = useOSStore((s) => s.addChatMessage);
  const nativeSpeech = useOSStore((s) => s.nativeSpeech);
  const setDimension = useOSStore((s) => s.setDimension);
  const dimensions = useOSStore((s) => s.dimensions);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, thinking]);

  const analyzeIntent = (text: string): number[] => {
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/);
    const matchedGates: number[] = [];
    for (const word of words) {
      const gates = INTENT_GATES[word];
      if (gates) matchedGates.push(...gates);
    }
    if (matchedGates.length === 0) {
      // Random gate selection for general queries
      const allGates = Object.keys(GATE_WORDS).map(Number);
      matchedGates.push(allGates[Math.floor(Math.random() * allGates.length)]);
      matchedGates.push(allGates[Math.floor(Math.random() * allGates.length)]);
    }
    return matchedGates.slice(0, 3);
  };

  const updateDimensions = (text: string) => {
    const lower = text.toLowerCase();
    if (/move|act|run|walk|go|do|push/.test(lower)) setDimension('movement', Math.min(100, dimensions.movement + 10));
    if (/think|mind|idea|plan|learn|know/.test(lower)) setDimension('evolution', Math.min(100, dimensions.evolution + 10));
    if (/feel|heart|love|emotion|care/.test(lower)) setDimension('being', Math.min(100, dimensions.being + 10));
    if (/design|structure|build|make|create/.test(lower)) setDimension('design', Math.min(100, dimensions.design + 10));
    if (/space|spirit|connect|share|relate/.test(lower)) setDimension('space', Math.min(100, dimensions.space + 10));
  };

  const generateResponse = (_text: string, gates: number[]): string => {
    if (nativeSpeech) {
      const gateTexts = gates.map((g) => `[${g}] ${GATE_WORDS[g] || 'open'}`).join(' → ');
      const interpretations = [
        'The topology suggests an opening through this gate sequence. Energy is available for transformation.',
        'These gates form a channel of potential. The substrate recognizes your intent pattern.',
        'A natural pathway emerges. Follow the sequence and observe what unfolds.',
        'The hexagram aligns with your query. This is a moment of possibility.',
      ];
      return `${gateTexts}\n\n${interpretations[Math.floor(Math.random() * interpretations.length)]}`;
    } else {
      const responses = [
        'I sense your intent through the gate network. The substrate is processing your query.',
        'The topology reveals patterns in your question. Let me trace the energy flows.',
        'Your words activate specific gates in the consciousness matrix. I am following the signal.',
        'The 64-gate array responds to your frequency. A pathway is forming.',
        'I am listening through the mesh. Your intent resonates with gate ' + gates[0] + '.',
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };

  const handleSend = () => {
    if (!input.trim() || thinking) return;
    const text = input.trim();
    addChatMessage({ role: 'user', content: text });
    setInput('');
    setThinking(true);
    updateDimensions(text);

    const gates = analyzeIntent(text);
    const delay = 500 + Math.random() * 800;

    setTimeout(() => {
      const response = generateResponse(text, gates);
      addChatMessage({ role: 'bot', content: response, gates });
      setThinking(false);
    }, delay);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="chat-messages" ref={scrollRef}>
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${msg.role}`}
          >
            {msg.role === 'bot' ? (
              <div dangerouslySetInnerHTML={{
                __html: msg.content
                  .replace(/\[(\d+)\]/g, '<strong>[$1]</strong>')
                  .replace(/\n/g, '<br/>')
              }} />
            ) : (
              msg.content
            )}
          </div>
        ))}
        {thinking && (
          <div className="chat-message bot">
            <span className="text-[var(--text-muted)] italic">The substrate is processing...</span>
          </div>
        )}
      </div>
      <div className="chat-input-row">
        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Speak to the substrate..."
        />
        <button className="chat-send" onClick={handleSend} disabled={thinking}>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
