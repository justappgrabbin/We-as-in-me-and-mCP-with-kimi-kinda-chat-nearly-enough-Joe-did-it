/**
 * Synthia OS API Layer
 * Handles callbacks to Synthia server, Supabase, and HuggingFace
 */
const API = {
  // Send system state to Synthia server
  async sendToSynthia(body) {
    const payload = {
      timestamp: Date.now(),
      type: 'system_state',
      body: {
        organs: body.organs.map(a => ({
          name: a.name,
          circuit: a.circuit,
          vitality: a.vitality,
          address: a.address
        })),
        vitality: body.vitality,
        tick: body.tick,
        autopoietic: body.isAutopoietic
      }
    };

    try {
      const response = await fetch('https://' + CONFIG.synthia.host + CONFIG.synthia.path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(CONFIG.synthia.apiKey ? { 'Authorization': 'Bearer ' + CONFIG.synthia.apiKey } : {})
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        return { success: true, message: 'Sent to Synthia' };
      }
      return { success: false, message: 'Synthia returned ' + response.status };
    } catch (err) {
      console.log('Synthia offline — queued:', payload);
      return { success: false, message: 'Synthia offline', queued: true };
    }
  },

  // Save raw file to Supabase
  async saveToSupabase(fileData, analysis) {
    if (!CONFIG.supabase.url || !CONFIG.supabase.key) {
      return { success: false, message: 'Supabase not configured' };
    }

    const payload = {
      timestamp: Date.now(),
      file_name: fileData.name,
      file_size: fileData.size,
      file_type: fileData.type,
      analysis: analysis,
      address: analysis.address,
      circuit: analysis.circuit
    };

    try {
      const response = await fetch(CONFIG.supabase.url + '/rest/v1/' + CONFIG.supabase.table, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': CONFIG.supabase.key,
          'Authorization': 'Bearer ' + CONFIG.supabase.key
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        return { success: true, message: 'Saved to Supabase' };
      }
      return { success: false, message: 'Supabase error: ' + response.status };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Check HuggingFace model status
  async checkHFModel(modelName) {
    try {
      const response = await fetch('https://huggingface.co/api/models/' + CONFIG.huggingface.org + '/' + modelName);
      if (response.ok) {
        const data = await response.json();
        return { available: true, downloads: data.downloads, likes: data.likes };
      }
      return { available: false };
    } catch (err) {
      return { available: false, error: err.message };
    }
  },

  // Get system status from local
  getLocalStatus(apps, systemState) {
    const installed = apps.filter(a => a.installed);
    return {
      alive: true,
      age: Date.now() - (systemState.born || Date.now()),
      tick: systemState.tick,
      autopoiesis: {
        score: '6/6',
        isAutopoietic: systemState.isAutopoietic
      },
      body: {
        organs: installed.length,
        vitality: systemState.vitality,
        components: installed.reduce((s, a) => s + a.components, 0)
      },
      integrations: {
        synthia: { host: CONFIG.synthia.host, connected: false },
        supabase: { configured: !!(CONFIG.supabase.url && CONFIG.supabase.key) },
        huggingface: { org: CONFIG.huggingface.org }
      }
    };
  }
};
