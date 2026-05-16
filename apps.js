/**
 * Synthia OS App Definitions
 * Pre-installed apps + app store + management
 */
const Apps = {
  // Default pre-installed apps
  defaults: [
    {
      id: 'app_terminal',
      name: 'Terminal',
      icon: '💻',
      circuit: 'Individual',
      color: '#8b5cf6',
      vitality: 0.85,
      components: 5,
      address: 'B1.T3.C3.G57.L4',
      installed: true,
      executable: true,
      description: 'System terminal and command interface'
    },
    {
      id: 'app_files',
      name: 'Files',
      icon: '📁',
      circuit: 'Collective',
      color: '#3b82f6',
      vitality: 0.78,
      components: 4,
      address: 'B3.T4.C2.G11.L4',
      installed: true,
      executable: true,
      description: 'File manager and ingestion interface'
    },
    {
      id: 'app_settings',
      name: 'Settings',
      icon: '⚙️',
      circuit: 'Tribal',
      color: '#ef4444',
      vitality: 0.92,
      components: 6,
      address: 'B4.T5.C5.G6.L3',
      installed: true,
      executable: true,
      description: 'System configuration and themes'
    },
    {
      id: 'app_admin',
      name: 'Admin',
      icon: '👑',
      circuit: 'Individual',
      color: '#f59e0b',
      vitality: 0.95,
      components: 8,
      address: 'B5.T6.C6.G1.L6',
      installed: true,
      executable: true,
      description: 'Admin panel and app store'
    }
  ],

  // Available apps in the store
  store: [
    { id: 'app_chat', name: 'Chat', icon: '💬', color: '#ec4899', circuit: 'Collective', description: 'AI chat interface' },
    { id: 'app_calc', name: 'Calc', icon: '🧮', color: '#f59e0b', circuit: 'Individual', description: 'Scientific calculator' },
    { id: 'app_notes', name: 'Notes', icon: '📝', color: '#10b981', circuit: 'Collective', description: 'Persistent notes' },
    { id: 'app_browser', name: 'Browser', icon: '🌐', color: '#3b82f6', circuit: 'Collective', description: 'Web view' },
    { id: 'app_music', name: 'Music', icon: '🎵', color: '#8b5cf6', circuit: 'Individual', description: 'Audio player' },
    { id: 'app_camera', name: 'Camera', icon: '📷', color: '#ef4444', circuit: 'Tribal', description: 'Photo capture' }
  ],

  // File analysis for ingestion
  analyzeFile(name, content) {
    const ext = name.split('.').pop().toLowerCase();
    const lines = content.split('\n');

    // Determine base from file type
    const baseMap = { js: 1, ts: 2, jsx: 1, tsx: 2, html: 3, css: 4, json: 5, md: 3, py: 2 };
    const base = baseMap[ext] || 3;

    // Determine tone from code patterns
    const hasAsync = content.includes('async') || content.includes('await');
    const hasEvents = content.includes('addEventListener') || content.includes('onClick');
    const hasLogic = content.includes('function') || content.includes('=>');
    const tone = hasAsync ? 3 : hasEvents ? 6 : hasLogic ? 4 : 2;

    // Determine color from content sentiment
    const hasErrors = content.includes('error') || content.includes('catch') || content.includes('throw');
    const hasExports = content.includes('export') || content.includes('module.exports');
    const colorNum = hasErrors ? 1 : hasExports ? 3 : 2;

    // Gate from filename hash
    const gate = (name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 64) + 1;

    // Line from file length
    const line = Math.min(6, Math.max(1, Math.floor(lines.length / 50)));

    // Circuit from gate
    const individualGates = [1, 2, 3, 10, 57, 28, 38, 54, 61, 39, 51, 55, 56, 60];
    const tribalGates = [4, 5, 6, 7, 8, 9, 21];
    const circuit = individualGates.includes(gate) ? 'Individual' : tribalGates.includes(gate) ? 'Tribal' : 'Collective';

    // Color from circuit
    const circuitColors = { Individual: '#8b5cf6', Collective: '#3b82f6', Tribal: '#ef4444' };

    return {
      base, tone, color: colorNum, gate, line, circuit,
      color: circuitColors[circuit],
      address: 'B' + base + '.T' + tone + '.C' + colorNum + '.G' + gate + '.L' + line,
      components: Math.max(1, Math.floor(content.length / 500))
    };
  },

  // Get icon for file type
  getFileIcon(name) {
    const ext = name.split('.').pop().toLowerCase();
    const icons = {
      js: '📜', ts: '📘', jsx: '⚛️', tsx: '⚛️', html: '🌐', css: '🎨',
      json: '📋', md: '📝', py: '🐍', txt: '📄', svg: '🎭', png: '🖼️', jpg: '🖼️'
    };
    return icons[ext] || '📄';
  }
};
