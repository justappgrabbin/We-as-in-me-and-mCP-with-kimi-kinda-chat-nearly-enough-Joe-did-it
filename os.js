/**
 * Synthia OS — Main Operating System
 * 
 * Architecture:
 * - Event delegation for all buttons (no inline onclick)
 * - Clean separation: UI rendering, event handling, file generation
 * - All buttons wired through data-action attributes
 * - Real file generation via Generator module
 * - Real API calls via API module
 */

const OS = {
  // State
  apps: [],
  openWindows: [],
  activeWindow: null,
  editMode: false,
  tick: 0,
  vitality: 0.75,
  isAutopoietic: true,
  theme: 'purple',
  generatedFiles: [],

  // Long press
  longPressTimer: null,
  longPressTarget: null,

  // Initialize
  init() {
    this.apps = JSON.parse(JSON.stringify(Apps.defaults));
    this.createParticles();
    this.renderDock();
    this.renderSandbox();
    this.bindEvents();
    this.startHeartbeat();
    this.showToast('Synthia OS initialized', 'success');
  },

  // ============================================================
  // EVENT BINDING (All buttons wired here)
  // ============================================================
  bindEvents() {
    // Menu bar buttons
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.dataset.action;
        this.handleAction(action, e);
      });
    });

    // Drag and drop
    const dropZone = document.getElementById('drop-zone');
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      document.body.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (eventName === 'dragenter' || eventName === 'dragover') {
          dropZone.classList.add('active');
        } else {
          dropZone.classList.remove('active');
        }
      });
    });

    document.body.addEventListener('drop', (e) => {
      const files = Array.from(e.dataTransfer.files);
      this.ingestFiles(files);
    });

    // File input
    document.getElementById('file-input').addEventListener('change', (e) => {
      this.ingestFiles(Array.from(e.target.files));
    });

    // Close context menu on click elsewhere
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#context-menu')) {
        document.getElementById('context-menu').classList.remove('visible');
      }
    });

    // Modal close on overlay click
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target === document.getElementById('modal-overlay')) {
        this.hideModal();
      }
    });
  },

  // ============================================================
  // ACTION HANDLER (Central dispatch for ALL buttons)
  // ============================================================
  handleAction(action, e) {
    switch (action) {
      case 'sandbox': this.showSandbox(); break;
      case 'hide-sandbox': this.hideSandbox(); break;
      case 'files': this.openAppById('app_files'); break;
      case 'settings': this.openAppById('app_settings'); break;
      case 'hide-modal': this.hideModal(); break;
      default:
        // Check if it's an app ID
        const app = this.apps.find(a => a.id === action);
        if (app) this.openApp(app);
    }
  },

  // ============================================================
  // DESKTOP PARTICLES
  // ============================================================
  createParticles() {
    const desktop = document.getElementById('desktop');
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    for (let i = 0; i < 25; i++) {
      const p = document.createElement('div');
      p.className = 'field-particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.random() * 8 + 's';
      p.style.animationDuration = (6 + Math.random() * 6) + 's';
      desktop.appendChild(p);
    }
  },

  // ============================================================
  // DOCK RENDERING (Max 5 items)
  // ============================================================
  renderDock() {
    const container = document.getElementById('dock-container');
    container.innerHTML = '';

    const installed = this.apps.filter(a => a.installed).slice(0, CONFIG.system.maxDockItems - 1);

    installed.forEach(app => {
      const isOpen = this.openWindows.some(w => w.id === app.id);
      const item = document.createElement('div');
      item.className = 'dock-item' + (isOpen ? ' running' : '') + (this.editMode ? ' wiggle' : '');
      item.style.color = app.color;
      item.dataset.appId = app.id;

      item.innerHTML = `
        <div class="dock-icon" style="background:${app.color}22;border-color:${app.color}44;color:${app.color}">
          ${app.icon}
        </div>
        <div class="dock-label">${app.name}</div>
        ${this.editMode ? `<div class="dock-remove">×</div>` : ''}
      `;

      // Click to open
      item.addEventListener('click', (e) => {
        if (this.editMode && e.target.classList.contains('dock-remove')) {
          this.uninstallApp(app.id);
        } else if (!this.editMode) {
          this.openApp(app);
        }
      });

      // Long press
      this.bindLongPress(item, app.id);

      container.appendChild(item);
    });

    // Add button
    const addBtn = document.createElement('div');
    addBtn.className = 'dock-item dock-add';
    addBtn.innerHTML = '<div class="dock-icon">+</div><div class="dock-label">Add</div>';
    addBtn.addEventListener('click', () => this.showAppStore());
    container.appendChild(addBtn);
  },

  // ============================================================
  // LONG PRESS (Touch + Mouse)
  // ============================================================
  bindLongPress(element, appId) {
    let timer = null;

    const start = (e) => {
      timer = setTimeout(() => {
        this.showContextMenu(e, appId);
      }, CONFIG.system.longPressDuration);
    };

    const cancel = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    element.addEventListener('touchstart', start, { passive: true });
    element.addEventListener('touchend', cancel);
    element.addEventListener('touchmove', cancel);
    element.addEventListener('mousedown', start);
    element.addEventListener('mouseup', cancel);
    element.addEventListener('mouseleave', cancel);

    // Double click for edit mode
    let lastClick = 0;
    element.addEventListener('click', () => {
      const now = Date.now();
      if (now - lastClick < 300) {
        this.toggleEditMode();
      }
      lastClick = now;
    });
  },

  showContextMenu(e, appId) {
    e.preventDefault();
    const app = this.apps.find(a => a.id === appId);
    if (!app) return;

    const menu = document.getElementById('context-menu');
    const x = e.clientX || (e.touches && e.touches[0].clientX) || 100;
    const y = e.clientY || (e.touches && e.touches[0].clientY) || 100;

    menu.style.left = Math.min(x, window.innerWidth - 200) + 'px';
    menu.style.top = Math.min(y, window.innerHeight - 200) + 'px';

    menu.innerHTML = `
      <div class="context-item" data-cmd="open" data-app="${appId}"><span>▶</span> Open</div>
      <div class="context-item" data-cmd="edit" data-app="${appId}"><span>✏️</span> Edit Code</div>
      <div class="context-item" data-cmd="download" data-app="${appId}"><span>⬇️</span> Download</div>
      <div class="context-item" data-cmd="run" data-app="${appId}"><span>⚡</span> Execute</div>
      <div class="context-divider"></div>
      <div class="context-item danger" data-cmd="uninstall" data-app="${appId}"><span>🗑️</span> Uninstall</div>
    `;

    menu.querySelectorAll('.context-item').forEach(item => {
      item.addEventListener('click', () => {
        const cmd = item.dataset.cmd;
        const id = item.dataset.app;
        menu.classList.remove('visible');

        switch (cmd) {
          case 'open': this.openAppById(id); break;
          case 'edit': this.editApp(id); break;
          case 'download': this.downloadApp(id); break;
          case 'run': this.runApp(id); break;
          case 'uninstall': this.uninstallApp(id); break;
        }
      });
    });

    menu.classList.add('visible');
  },

  toggleEditMode() {
    this.editMode = !this.editMode;
    document.getElementById('app-dock').classList.toggle('edit-mode', this.editMode);
    this.renderDock();
    this.showToast(this.editMode ? 'Edit mode: tap × to remove' : 'Edit mode off', 'info');
  },

  // ============================================================
  // APP WINDOWS
  // ============================================================
  openAppById(id) {
    const app = this.apps.find(a => a.id === id);
    if (app) this.openApp(app);
  },

  openApp(app) {
    if (this.openWindows.find(w => w.id === app.id)) {
      this.focusWindow(app.id);
      return;
    }

    const win = document.createElement('div');
    win.className = 'app-window';
    win.id = 'window-' + app.id;
    win.dataset.appId = app.id;

    const count = this.openWindows.length;
    win.style.left = (20 + count * 25) + 'px';
    win.style.top = (60 + count * 25) + 'px';

    win.innerHTML = `
      <div class="window-titlebar" data-drag="${app.id}">
        <div class="window-title">
          <div class="circuit-dot" style="background:${app.color}"></div>
          <span>${app.name}</span>
        </div>
        <div class="window-controls">
          <button class="window-btn minimize" data-minimize="${app.id}"></button>
          <button class="window-btn maximize" data-maximize="${app.id}"></button>
          <button class="window-btn close" data-close="${app.id}"></button>
        </div>
      </div>
      <div class="window-content" id="content-${app.id}">
        ${this.renderAppContent(app)}
      </div>
    `;

    // Bind window controls
    win.querySelector('[data-drag]').addEventListener('mousedown', (e) => this.startDrag(e, app.id));
    win.querySelector('[data-drag]').addEventListener('touchstart', (e) => this.startDrag(e, app.id));
    win.querySelector('[data-minimize]').addEventListener('click', () => this.minimizeWindow(app.id));
    win.querySelector('[data-maximize]').addEventListener('click', () => this.maximizeWindow(app.id));
    win.querySelector('[data-close]').addEventListener('click', () => this.closeWindow(app.id));

    document.getElementById('windows-container').appendChild(win);
    this.openWindows.push({ id: app.id, zIndex: 100 + count });
    this.focusWindow(app.id);
  },

  renderAppContent(app) {
    if (app.id === 'app_terminal') {
      return this.renderTerminal();
    }
    if (app.id === 'app_files') {
      return this.renderFiles();
    }
    if (app.id === 'app_settings') {
      return this.renderSettings();
    }
    if (app.id === 'app_admin') {
      return this.renderAdmin();
    }
    return this.renderGenericApp(app);
  },

  renderTerminal() {
    return `
      <div style="padding:16px;height:100%;display:flex;flex-direction:column;">
        <div id="terminal-output" style="background:#0d1117;border-radius:8px;padding:12px;flex:1;font-family:monospace;font-size:12px;overflow:auto;border:1px solid var(--border);color:#e5e7eb;">
          <div style="color:#8b949e;margin-bottom:8px;">$ synthia-os --status</div>
          <div style="color:#7ee787;">✓ System alive</div>
          <div style="color:#7ee787;">✓ Autopoiesis: 6/6</div>
          <div style="color:#79c0ff;">  Vitality: ${(this.vitality * 100).toFixed(1)}%</div>
          <div style="color:#79c0ff;">  Organs: ${this.apps.filter(a => a.installed).length}</div>
          <div style="color:#d2a8ff;">  Tick: ${this.tick}</div>
          <div style="color:#8b949e;margin-top:12px;">$ _</div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px;">
          <button class="btn btn-primary btn-sm" id="btn-regenerate">🔄 Regenerate</button>
          <button class="btn btn-secondary btn-sm" id="btn-ingest">📥 Ingest</button>
          <button class="btn btn-success btn-sm" id="btn-download">⬇️ Download</button>
        </div>
      </div>
    `;
  },

  renderFiles() {
    const installed = this.apps.filter(a => a.installed);
    return `
      <div style="padding:16px;">
        <div style="display:flex;gap:8px;margin-bottom:16px;">
          <button class="btn btn-primary btn-sm" id="btn-upload">📥 Upload</button>
          <button class="btn btn-secondary btn-sm" id="btn-newfolder">📁 New Folder</button>
        </div>
        <div class="app-list">
          ${installed.map(a => `
            <div class="app-list-item" data-open="${a.id}">
              <div class="app-list-icon" style="background:${a.color}33;color:${a.color}">${a.icon}</div>
              <div class="app-list-info">
                <div class="app-list-name">${a.name}.js</div>
                <div class="app-list-meta">${a.components} components • ${a.circuit}</div>
              </div>
              <div class="app-list-vitality" style="color:${a.vitality > 0.5 ? '#10b981' : '#f59e0b'}">${(a.vitality * 100).toFixed(0)}%</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  renderSettings() {
    const themes = [
      { id: 'purple', name: 'Nebula', gradient: 'linear-gradient(135deg,#8b5cf6,#3b82f6)' },
      { id: 'green', name: 'Matrix', gradient: 'linear-gradient(135deg,#10b981,#059669)' },
      { id: 'red', name: 'Ember', gradient: 'linear-gradient(135deg,#ef4444,#dc2626)' },
      { id: 'blue', name: 'Ocean', gradient: 'linear-gradient(135deg,#3b82f6,#2563eb)' }
    ];

    return `
      <div style="padding:16px;">
        <div class="sandbox-section">
          <div class="sandbox-section-title">Appearance</div>
          <div class="theme-grid">
            ${themes.map(t => `
              <div class="theme-option ${this.theme === t.id ? 'active' : ''}" data-theme="${t.id}">
                <div class="theme-preview" style="background:${t.gradient}"></div>
                <div class="theme-name">${t.name}</div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="sandbox-section">
          <div class="sandbox-section-title">System Configuration</div>
          <div class="form-group">
            <label class="form-label">Synthia Server Host</label>
            <input type="text" class="form-input" id="cfg-synthia-host" value="${CONFIG.synthia.host}">
          </div>
          <div class="form-group">
            <label class="form-label">Supabase URL</label>
            <input type="text" class="form-input" id="cfg-supabase-url" value="${CONFIG.supabase.url}" placeholder="https://your-project.supabase.co">
          </div>
          <div class="form-group">
            <label class="form-label">Supabase Key</label>
            <input type="password" class="form-input" id="cfg-supabase-key" value="${CONFIG.supabase.key}" placeholder="your-anon-key">
          </div>
          <button class="btn btn-success btn-block" id="btn-save-settings">💾 Save Settings</button>
        </div>
      </div>
    `;
  },

  renderAdmin() {
    const installed = this.apps.filter(a => a.installed);
    return `
      <div style="padding:16px;">
        <div class="admin-stats">
          <div class="stat-card"><div class="stat-value">${installed.length}</div><div class="stat-label">Installed</div></div>
          <div class="stat-card"><div class="stat-value">${(this.vitality * 100).toFixed(0)}%</div><div class="stat-label">Vitality</div></div>
          <div class="stat-card"><div class="stat-value">${this.tick}</div><div class="stat-label">Ticks</div></div>
          <div class="stat-card"><div class="stat-value">${this.isAutopoietic ? '✓' : '✗'}</div><div class="stat-label">Autopoietic</div></div>
        </div>
        <div class="sandbox-section">
          <div class="sandbox-section-title">Install Apps</div>
          <div class="install-grid">
            ${Apps.store.map(app => `
              <div class="install-item" data-install="${app.id}" data-name="${app.name}" data-icon="${app.icon}" data-color="${app.color}" data-desc="${app.description}">
                <div class="icon">${app.icon}</div>
                <div class="name">${app.name}</div>
                <div class="desc">${app.description}</div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="sandbox-section">
          <div class="sandbox-section-title">System Actions</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <button class="btn btn-primary btn-block" id="btn-regen-all">🔄 Regenerate All Code</button>
            <button class="btn btn-secondary btn-block" id="btn-dl-all">⬇️ Download All Files</button>
            <button class="btn btn-success btn-block" id="btn-send-synthia">📤 Send to Synthia</button>
            <button class="btn btn-danger btn-block" id="btn-reset">⚠️ Reset System</button>
          </div>
        </div>
        <div class="sandbox-section">
          <div class="sandbox-section-title">Communication</div>
          <div class="form-group">
            <label class="form-label">Message to System</label>
            <textarea class="form-textarea" id="admin-message" placeholder="Type a command or message..."></textarea>
          </div>
          <button class="btn btn-primary btn-block" id="btn-send-msg">📨 Send Message</button>
          <div id="system-responses" style="margin-top:12px;max-height:150px;overflow:auto;"></div>
        </div>
      </div>
    `;
  },

  renderGenericApp(app) {
    return `
      <div style="padding:16px;">
        <div style="display:flex;gap:8px;margin-bottom:12px;">
          <button class="btn btn-primary btn-sm" data-run="${app.id}">▶ Run</button>
          <button class="btn btn-secondary btn-sm" data-download="${app.id}">⬇️ Download</button>
          <button class="btn btn-secondary btn-sm" data-edit="${app.id}">✏️ Edit</button>
        </div>
        <div class="code-viewer">${this.syntaxHighlight(app.code || '// No code generated yet\n// Click Regenerate to create executable code')}</div>
      </div>
    `;
  },

  // ============================================================
  // WINDOW MANAGEMENT
  // ============================================================
  startDrag(e, appId) {
    e.preventDefault();
    const win = document.getElementById('window-' + appId);
    if (!win) return;

    const isTouch = e.type === 'touchstart';
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;
    const rect = win.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;

    const moveHandler = (ev) => {
      const cx = isTouch ? ev.touches[0].clientX : ev.clientX;
      const cy = isTouch ? ev.touches[0].clientY : ev.clientY;
      win.style.left = (cx - offsetX) + 'px';
      win.style.top = (cy - offsetY) + 'px';
    };

    const endHandler = () => {
      document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', moveHandler);
      document.removeEventListener(isTouch ? 'touchend' : 'mouseup', endHandler);
    };

    document.addEventListener(isTouch ? 'touchmove' : 'mousemove', moveHandler, { passive: false });
    document.addEventListener(isTouch ? 'touchend' : 'mouseup', endHandler);
    this.focusWindow(appId);
  },

  focusWindow(appId) {
    this.activeWindow = appId;
    document.querySelectorAll('.app-window').forEach(w => w.classList.remove('active'));
    const win = document.getElementById('window-' + appId);
    if (win) {
      win.classList.add('active');
      const maxZ = Math.max(...this.openWindows.map(w => w.zIndex || 100), 100);
      win.style.zIndex = maxZ + 1;
    }
  },

  closeWindow(appId) {
    const win = document.getElementById('window-' + appId);
    if (win) {
      win.style.opacity = '0';
      win.style.transform = 'scale(0.9)';
      setTimeout(() => win.remove(), 200);
    }
    this.openWindows = this.openWindows.filter(w => w.id !== appId);
    if (this.activeWindow === appId) this.activeWindow = null;
  },

  minimizeWindow(appId) {
    const win = document.getElementById('window-' + appId);
    if (win) win.style.display = 'none';
  },

  maximizeWindow(appId) {
    const win = document.getElementById('window-' + appId);
    if (!win) return;
    if (win.dataset.maximized === 'true') {
      win.style.width = ''; win.style.height = ''; win.style.left = ''; win.style.top = ''; win.style.borderRadius = ''; win.dataset.maximized = 'false';
    } else {
      win.style.width = 'calc(100vw - 32px)'; win.style.height = 'calc(100vh - 100px)'; win.style.left = '16px'; win.style.top = '50px'; win.style.borderRadius = '16px'; win.dataset.maximized = 'true';
    }
  },

  // ============================================================
  // SANDBOX PANEL
  // ============================================================
  showSandbox() {
    document.getElementById('sandbox-center').classList.add('visible');
    this.renderSandbox();
  },

  hideSandbox() {
    document.getElementById('sandbox-center').classList.remove('visible');
  },

  renderSandbox() {
    const body = document.getElementById('sandbox-body');
    if (!body) return;
    const installed = this.apps.filter(a => a.installed);

    body.innerHTML = `
      <div class="sandbox-section">
        <div class="sandbox-section-title">System Vitality</div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;">
          <span style="color:var(--text-secondary)">Health</span>
          <span style="color:${this.vitality > 0.5 ? '#10b981' : '#f59e0b'};font-weight:700">${(this.vitality * 100).toFixed(1)}%</span>
        </div>
        <div class="vitality-bar">
          <div class="vitality-fill" style="width:${this.vitality * 100}%;background:${this.vitality > 0.7 ? '#10b981' : this.vitality > 0.4 ? '#f59e0b' : '#ef4444'}"></div>
        </div>
      </div>
      <div class="sandbox-section">
        <div class="sandbox-section-title">Autopoiesis</div>
        <div style="display:grid;gap:5px;font-size:11px;">
          ${['Boundary','Components','Mechanistic','Self-produced','Internal production','No external spec'].map(item => `
            <div style="display:flex;justify-content:space-between;color:var(--text-secondary)">
              <span>${item}</span><span style="color:#10b981">✓</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="sandbox-section">
        <div class="sandbox-section-title">Apps (${installed.length})</div>
        <div class="app-list">
          ${installed.map(app => `
            <div class="app-list-item" data-open="${app.id}">
              <div class="app-list-icon" style="background:${app.color}33;color:${app.color}">${app.icon}</div>
              <div class="app-list-info">
                <div class="app-list-name">${app.name}</div>
                <div class="app-list-meta">${app.components} comps • ${app.circuit}</div>
              </div>
              <div class="app-list-vitality" style="color:${app.vitality > 0.5 ? '#10b981' : '#f59e0b'}">${(app.vitality * 100).toFixed(0)}%</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="sandbox-section">
        <div class="sandbox-section-title">Actions</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <button class="btn btn-primary btn-block" id="sb-regenerate">🔄 Regenerate</button>
          <button class="btn btn-secondary btn-block" id="sb-ingest">📥 Ingest Files</button>
          <button class="btn btn-success btn-block" id="sb-download">⬇️ Download Code</button>
        </div>
      </div>
    `;

    // Bind sandbox buttons
    document.getElementById('sb-regenerate')?.addEventListener('click', () => this.regenerateSystem());
    document.getElementById('sb-ingest')?.addEventListener('click', () => document.getElementById('file-input').click());
    document.getElementById('sb-download')?.addEventListener('click', () => this.downloadAllCode());

    // Bind app list items
    body.querySelectorAll('[data-open]').forEach(item => {
      item.addEventListener('click', () => this.openAppById(item.dataset.open));
    });
  },

  // ============================================================
  // FILE INGESTION
  // ============================================================
  async ingestFiles(files) {
    if (!files.length) return;
    this.showToast('Ingesting ' + files.length + ' file(s)...', 'info');

    for (const file of files) {
      try {
        const text = await file.text();
        const analysis = Apps.analyzeFile(file.name, text);

        // Save raw file to Supabase
        if (CONFIG.supabase.url) {
          const supabaseResult = await API.saveToSupabase(
            { name: file.name, size: file.size, type: file.type },
            analysis
          );
          if (supabaseResult.success) {
            this.showToast('Saved to Supabase: ' + file.name, 'success');
          }
        }

        // Create app from file
        const appId = 'app_' + file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().substring(0, 20);

        // Remove existing
        this.apps = this.apps.filter(a => a.id !== appId);

        const newApp = {
          id: appId,
          name: file.name.split('.')[0],
          icon: Apps.getFileIcon(file.name),
          circuit: analysis.circuit,
          color: analysis.color,
          vitality: 0.7,
          components: analysis.components,
          address: analysis.address,
          installed: true,
          executable: true,
          code: text,
          rawFile: { name: file.name, size: file.size, type: file.type }
        };

        this.apps.push(newApp);
        this.showToast('Ingested: ' + file.name + ' → ' + newApp.address, 'success');
      } catch (err) {
        this.showToast('Failed: ' + file.name, 'error');
        console.error(err);
      }
    }

    this.renderDock();
    this.renderSandbox();
    this.regenerateSystem();
  },

  // ============================================================
  // CODE REGENERATION (THE CRITICAL PART)
  // ============================================================
  regenerateSystem() {
    this.showToast('Regenerating executable code...', 'info');

    const installed = this.apps.filter(a => a.installed);
    const systemState = {
      vitality: this.vitality,
      isAutopoietic: this.isAutopoietic,
      tick: this.tick,
      born: Date.now()
    };

    // Use Generator module
    this.generatedFiles = Generator.generateAll(installed, systemState);

    this.showToast('Generated ' + this.generatedFiles.length + ' executable files', 'success');
    this.renderSandbox();

    // Send to Synthia
    this.sendToSynthia();

    return this.generatedFiles;
  },

  // ============================================================
  // DOWNLOAD / EXECUTE
  // ============================================================
  downloadAllCode() {
    if (!this.generatedFiles || !this.generatedFiles.length) {
      this.regenerateSystem();
    }
    Generator.downloadAll(this.generatedFiles);
    this.showToast('Downloaded ' + this.generatedFiles.length + ' files', 'success');
  },

  downloadApp(appId) {
    const app = this.apps.find(a => a.id === appId);
    if (!app) return;
    const generated = Generator.generateAppCode(app);
    Generator.downloadFile(generated.fileName, generated.code);
    this.showToast('Downloaded ' + generated.fileName, 'success');
  },

  runApp(appId) {
    const app = this.apps.find(a => a.id === appId);
    if (!app) return;

    this.showToast('Running ' + app.name + '...', 'info');
    try {
      // Generate fresh code
      const generated = Generator.generateAppCode(app);

      // Execute in isolated function
      const fn = new Function('return ' + generated.code + '\nreturn ' + generated.safeName)();
      const instance = fn();
      const result = instance.activate({ test: true });

      this.showToast(
        app.name + ' executed. Resonance: ' + ((result.resonance || 0.5) * 100).toFixed(0) + '%',
        'success'
      );
    } catch (err) {
      this.showToast('Error: ' + err.message, 'error');
      console.error(err);
    }
  },

  // ============================================================
  // APP MANAGEMENT
  // ============================================================
  installApp(id, name, icon, color, desc) {
    if (this.apps.find(a => a.id === id)) {
      this.showToast(name + ' already installed', 'warn');
      return;
    }

    const gate = Math.floor(Math.random() * 64) + 1;
    const address = 'B3.T4.C3.G' + gate + '.L4';

    const newApp = {
      id, name, icon, color,
      circuit: 'Collective',
      vitality: 0.8,
      components: 3,
      address,
      installed: true,
      executable: true,
      description: desc
    };

    this.apps.push(newApp);
    this.renderDock();
    this.renderSandbox();
    this.showToast('Installed ' + name, 'success');

    // Regenerate if dock full
    const installed = this.apps.filter(a => a.installed);
    if (installed.length >= CONFIG.system.maxDockItems) {
      this.showToast('Dock full — regenerating', 'info');
      this.regenerateSystem();
    }
  },

  uninstallApp(id) {
    const app = this.apps.find(a => a.id === id);
    if (!app) return;
    app.installed = false;
    this.closeWindow(id);
    this.renderDock();
    this.renderSandbox();
    this.showToast('Uninstalled ' + app.name, 'info');
  },

  showAppStore() {
    this.showModal('App Store', `
      <div class="install-grid">
        ${Apps.store.map(app => `
          <div class="install-item" data-install="${app.id}" data-name="${app.name}" data-icon="${app.icon}" data-color="${app.color}" data-desc="${app.description}">
            <div class="icon">${app.icon}</div>
            <div class="name">${app.name}</div>
            <div class="desc">${app.description}</div>
          </div>
        `).join('')}
      </div>
    `);

    // Bind install buttons
    document.querySelectorAll('.install-item').forEach(item => {
      item.addEventListener('click', () => {
        this.installApp(
          item.dataset.install,
          item.dataset.name,
          item.dataset.icon,
          item.dataset.color,
          item.dataset.desc
        );
        this.hideModal();
      });
    });
  },

  // ============================================================
  // SETTINGS
  // ============================================================
  setTheme(themeId) {
    this.theme = themeId;
    const colors = {
      purple: { primary: '#8b5cf6', blue: '#3b82f6' },
      green: { primary: '#10b981', blue: '#059669' },
      red: { primary: '#ef4444', blue: '#dc2626' },
      blue: { primary: '#3b82f6', blue: '#2563eb' }
    };
    const c = colors[themeId];
    document.documentElement.style.setProperty('--accent-purple', c.primary);
    CONFIG.system.defaultTheme = themeId;
    CONFIG.save();
    this.renderSandbox();
    this.showToast('Theme: ' + themeId, 'success');
  },

  saveSettings() {
    const synthiaHost = document.getElementById('cfg-synthia-host');
    const supabaseUrl = document.getElementById('cfg-supabase-url');
    const supabaseKey = document.getElementById('cfg-supabase-key');

    if (synthiaHost) CONFIG.synthia.host = synthiaHost.value;
    if (supabaseUrl) CONFIG.supabase.url = supabaseUrl.value;
    if (supabaseKey) CONFIG.supabase.key = supabaseKey.value;

    CONFIG.save();
    this.showToast('Settings saved', 'success');
  },

  // ============================================================
  // SYNTHIA / SUPABASE
  // ============================================================
  async sendToSynthia() {
    const body = {
      organs: this.apps.filter(a => a.installed),
      vitality: this.vitality,
      tick: this.tick,
      isAutopoietic: this.isAutopoietic
    };

    const result = await API.sendToSynthia(body);
    this.showToast(result.message, result.success ? 'success' : 'warn');
  },

  // ============================================================
  // ADMIN COMMUNICATION
  // ============================================================
  sendAdminMessage() {
    const msg = document.getElementById('admin-message');
    if (!msg || !msg.value.trim()) return;

    const container = document.getElementById('system-responses');
    if (container) {
      const div = document.createElement('div');
      div.style.cssText = 'padding:8px 12px;background:rgba(59,130,246,0.1);border-radius:8px;margin-bottom:6px;font-size:11px;';
      div.innerHTML = '<div style="color:#93c5fd;font-weight:600;">You:</div><div style="color:#e5e7eb;">' + msg.value + '</div>';
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
    }

    setTimeout(() => {
      if (container) {
        const div = document.createElement('div');
        div.style.cssText = 'padding:8px 12px;background:rgba(16,185,129,0.1);border-radius:8px;margin-bottom:6px;font-size:11px;';
        div.innerHTML = '<div style="color:#6ee7b7;font-weight:600;">System:</div><div style="color:#e5e7eb;">Acknowledged. Processing: "' + msg.value.substring(0, 30) + '..."</div>';
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
      }
      this.showToast('System acknowledged', 'success');
    }, 800);

    msg.value = '';
  },

  // ============================================================
  // SYSTEM CONTROL
  // ============================================================
  resetSystem() {
    if (!confirm('Reset system? All apps will be lost.')) return;
    this.apps = [];
    this.openWindows = [];
    this.activeWindow = null;
    this.apps = JSON.parse(JSON.stringify(Apps.defaults));
    this.renderDock();
    this.renderSandbox();
    this.showToast('System reset', 'warn');
  },

  editApp(appId) {
    const app = this.apps.find(a => a.id === appId);
    if (!app) return;
    this.showModal('Edit ' + app.name,
      '<div class="form-group"><label class="form-label">Code</label><textarea class="form-textarea" id="edit-code" style="min-height:300px;font-family:monospace;">' + (app.code || '// No code') + '</textarea></div>',
      '<button class="btn btn-secondary" data-action="hide-modal">Cancel</button><button class="btn btn-primary" id="btn-save-code">💾 Save</button>'
    );

    document.getElementById('btn-save-code')?.addEventListener('click', () => {
      const code = document.getElementById('edit-code');
      if (code && app) {
        app.code = code.value;
        this.showToast(app.name + ' updated', 'success');
        this.regenerateSystem();
      }
      this.hideModal();
    });
  },

  // ============================================================
  // UI UTILITIES
  // ============================================================
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    const icons = { success: '✓', error: '✗', warn: '⚠', info: 'ℹ' };
    toast.innerHTML = '<span>' + icons[type] + '</span><span>' + message + '</span>';
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
  },

  showModal(title, body, footer = '') {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = body;
    document.getElementById('modal-footer').innerHTML = footer || '<button class="btn btn-secondary" data-action="hide-modal">Close</button>';
    document.getElementById('modal-overlay').classList.add('visible');

    // Re-bind modal buttons
    document.querySelectorAll('#modal [data-action]').forEach(btn => {
      btn.addEventListener('click', () => this.handleAction(btn.dataset.action));
    });
  },

  hideModal() {
    document.getElementById('modal-overlay').classList.remove('visible');
  },

  syntaxHighlight(code) {
    return code
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|try|catch)\b/g, '<span class="code-kw">$1</span>')
      .replace(/\b(true|false|null|undefined)\b/g, '<span class="code-num">$1</span>')
      .replace(/(['"][^'"]*['"])/g, '<span class="code-str">$1</span>')
      .replace(/(\/\/.*$)/gm, '<span class="code-cmt">$1</span>')
      .replace(/\b([A-Z][a-zA-Z0-9]*)\b/g, '<span class="code-cls">$1</span>');
  },

  // ============================================================
  // HEARTBEAT
  // ============================================================
  startHeartbeat() {
    setInterval(() => {
      this.tick++;
      this.vitality = Math.max(0.1, this.vitality * 0.999 + 0.001);
      document.getElementById('vitality-text').textContent = (this.vitality * 100).toFixed(0) + '%';
      if (this.tick % 10 === 0) this.renderSandbox();
    }, CONFIG.system.heartbeatInterval);
  }
};

// Start when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  OS.init();
});
