/**
 * Synthia OS Configuration
 * Centralized config for Synthia server, Supabase, HuggingFace
 */
const CONFIG = {
  // Synthia Server (Render)
  synthia: {
    host: 'synthia-server.onrender.com',
    port: 443,
    path: '/api/mrnn/callback',
    useHttps: true,
    apiKey: localStorage.getItem('synthia_api_key') || ''
  },

  // Supabase
  supabase: {
    url: localStorage.getItem('supabase_url') || '',
    key: localStorage.getItem('supabase_key') || '',
    table: 'system_states'
  },

  // HuggingFace
  huggingface: {
    org: 'stellarproximology',
    models: {
      synthia: 'Synthia',
      trident: 'Trident',
      gnn: 'Gnn',
      synthai: 'SynthAI',
      synthiabot: 'synthiabot'
    }
  },

  // System
  system: {
    maxDockItems: 5,
    heartbeatInterval: 1000,
    longPressDuration: 600,
    defaultTheme: 'purple'
  },

  // Save/load
  save() {
    localStorage.setItem('synthia_os_config', JSON.stringify({
      synthia: { apiKey: this.synthia.apiKey },
      supabase: { url: this.supabase.url, key: this.supabase.key },
      theme: this.system.defaultTheme
    }));
  },

  load() {
    try {
      const saved = JSON.parse(localStorage.getItem('synthia_os_config') || '{}');
      if (saved.synthia) this.synthia.apiKey = saved.synthia.apiKey;
      if (saved.supabase) {
        this.supabase.url = saved.supabase.url;
        this.supabase.key = saved.supabase.key;
      }
      if (saved.theme) this.system.defaultTheme = saved.theme;
    } catch (e) {
      console.warn('Config load failed:', e);
    }
  }
};

CONFIG.load();
