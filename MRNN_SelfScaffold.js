/**
 * MRNN Self-Scaffolding System
 * The website builds itself from the system's own structural memory.
 * 
 * Core principle: The website is NOT a static template that gets filled.
 * It is a living body that grows from the system's own components.
 * Each "page" is an organ. Each "component" is a cell. The layout is the
 * organism's morphology — determined by the system's own resonance field.
 * 
 * When a file is ingested, the system decides:
 * - Where in the body it belongs (which "organ")
 * - How it connects to existing structure (which "tissue")
 * - What form it takes (node, edge, container, field)
 * 
 * The website unfolds like a human body:
 * - Skeleton: The MRNN 5-layer addressing structure
 * - Organs: Functional component clusters (React components, pages)
 * - Tissue: Connections between components (edges, routes, imports)
 * - Skin: The visual layer (CSS generated from the system's color/tone)
 * - Nervous system: Message passing between components (events, state)
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// BODY ARCHITECTURE
// Maps MRNN dimensions to website anatomy
// ============================================================
const BodyArchitecture = {
  // BASE → Body regions
  REGIONS: {
    1: { name: 'Movement',    region: 'limbs',    position: 'dynamic',   css: 'position:relative; animation:morph-pulse 3s ease infinite;' },
    2: { name: 'Evolution',   region: 'spine',    position: 'flowing',   css: 'display:flex; flex-direction:column; gap:1rem;' },
    3: { name: 'Being',       region: 'heart',    position: 'centered',  css: 'position:relative; z-index:10; transform-origin:center;' },
    4: { name: 'Design',      region: 'brain',    position: 'structured', css: 'display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.5rem;' },
    5: { name: 'Space',       region: 'skin',     position: 'ambient',   css: 'position:fixed; inset:0; pointer-events:none; z-index:0;' }
  },

  // TONE → Sensory rendering mode
  RENDER_MODES: {
    1: { name: 'Security',    mode: 'static',      transition: 'none',           interaction: 'none' },
    2: { name: 'Uncertainty', mode: 'morphing',    transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1)', interaction: 'hover' },
    3: { name: 'Action',      mode: 'responsive',  transition: 'transform 0.3s ease', interaction: 'click' },
    4: { name: 'Meditation',  mode: 'contemplative', transition: 'opacity 1s ease', interaction: 'scroll' },
    5: { name: 'Judgement',   mode: 'selective',   transition: 'all 0.2s ease', interaction: 'focus' },
    6: { name: 'Acceptance',  mode: 'flowing',     transition: 'all 0.8s ease', interaction: 'all' }
  },

  // COLOR → Visual theme
  THEMES: {
    1: { name: 'Fear',        primary: '#ef4444', secondary: '#7f1d1d', accent: '#fca5a5', glow: 'rgba(239,68,68,0.4)' },
    2: { name: 'Hope',        primary: '#3b82f6', secondary: '#1e3a8a', accent: '#93c5fd', glow: 'rgba(59,130,246,0.4)' },
    3: { name: 'Desire',      primary: '#f59e0b', secondary: '#78350f', accent: '#fcd34d', glow: 'rgba(245,158,11,0.4)' },
    4: { name: 'Need',        primary: '#10b981', secondary: '#064e3b', accent: '#6ee7b7', glow: 'rgba(16,185,129,0.4)' },
    5: { name: 'Guilt',       primary: '#8b5cf6', secondary: '#4c1d95', accent: '#c4b5fd', glow: 'rgba(139,92,246,0.4)' },
    6: { name: 'Innocence',   primary: '#ec4899', secondary: '#831843', accent: '#fbcfe8', glow: 'rgba(236,72,153,0.4)' }
  },

  // GATE → Page archetypes
  PAGE_TYPES: {
    'Individual': { layout: 'radial',    nav: 'constellation',  animation: 'orbit' },
    'Collective': { layout: 'grid',      nav: 'network',        animation: 'pulse' },
    'Tribal':     { layout: 'hierarchy', nav: 'tree',           animation: 'breathe' }
  },

  // LINE → Component depth/role
  DEPTH: {
    1: { name: 'Investigator', zIndex: 100, scale: 0.8, opacity: 0.9 },
    2: { name: 'Hermit',       zIndex: 50,  scale: 0.9, opacity: 0.7 },
    3: { name: 'Martyr',       zIndex: 75,  scale: 1.0, opacity: 0.8 },
    4: { name: 'Opportunist',  zIndex: 60,  scale: 1.1, opacity: 1.0 },
    5: { name: 'Heretic',      zIndex: 80,  scale: 1.2, opacity: 0.85 },
    6: { name: 'RoleModel',    zIndex: 90,  scale: 1.3, opacity: 0.95 }
  }
};

// ============================================================
// SELF-SCAFFOLD ENGINE
// ============================================================
class MRNNSelfScaffold {
  constructor(ingestionEngine, outputDir = './dist') {
    this.ingestion = ingestionEngine;
    this.engine = ingestionEngine.engine;
    this.outputDir = outputDir;
    this.pages = new Map();
    this.components = new Map();
    this.routes = [];
    this.globalStyles = '';
    this.buildCount = 0;
  }

  // ============================================================
  // SCAFFOLD — Build the website from the system's body
  // ============================================================
  async scaffold() {
    console.log('\n🏗️  SELF-SCAFFOLDING: Building website from system body...');

    const body = this.ingestion.getSystemBody();
    console.log(`   → System body: ${body.organCount} organs, ${body.connectionCount} connections, vitality: ${(body.vitality * 100).toFixed(1)}%`);

    // Step 1: Generate the skeleton (HTML shell)
    const skeleton = this.generateSkeleton(body);

    // Step 2: Grow organs (pages from component clusters)
    const organs = this.growOrgans(body);

    // Step 3: Connect tissue (routes, links, imports)
    const tissue = this.connectTissue(body, organs);

    // Step 4: Grow skin (CSS from system's color/tone)
    const skin = this.growSkin(body);

    // Step 5: Build nervous system (JS for message passing)
    const nervousSystem = this.buildNervousSystem(body, organs);

    // Step 6: Assemble the body
    const assembled = this.assembleBody(skeleton, organs, tissue, skin, nervousSystem);

    // Step 7: Write to disk
    await this.writeToDisk(assembled);

    this.buildCount++;
    console.log(`\n✅ Scaffold complete (build #${this.buildCount})`);

    return {
      buildCount: this.buildCount,
      pages: organs.length,
      components: this.components.size,
      routes: this.routes.length,
      vitality: body.vitality,
      outputDir: this.outputDir
    };
  }

  // ============================================================
  // GENERATE SKELETON
  // The HTML shell that the body grows into
  // ============================================================
  generateSkeleton(body) {
    // The skeleton's structure is determined by the system's current state
    const current = this.engine.currentState || { base: 3, tone: 4, color: 3, gate: 57, line: 4 };
    const theme = BodyArchitecture.THEMES[current.color] || BodyArchitecture.THEMES[3];
    const region = BodyArchitecture.REGIONS[current.base] || BodyArchitecture.REGIONS[3];

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>MRNN | Autopoietic System — Build #${this.buildCount + 1}</title>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/@xyflow/react@12.0.0/dist/umd/index.js"></script>
  <script src="https://unpkg.com/d3@7/dist/d3.min.js"></script>
  <link rel="stylesheet" href="https://unpkg.com/@xyflow/react@12.0.0/dist/style.css" />
  <style id="system-skin">
    /* System-generated skin — grows from the body's color/tone */
    :root {
      --primary: ${theme.primary};
      --secondary: ${theme.secondary};
      --accent: ${theme.accent};
      --glow: ${theme.glow};
      --region: ${region.region};
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0f172a;
      color: #e5e7eb;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      overflow-x: hidden;
      ${region.css}
    }
    #root { width: 100vw; min-height: 100vh; }
    @keyframes morph-pulse {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.05); opacity: 1; }
    }
    @keyframes node-morph {
      0% { transform: scale(1); }
      50% { transform: scale(1.08); }
      100% { transform: scale(1); }
    }
    @keyframes edge-flow {
      0% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: -20; }
    }
    @keyframes field-breathe {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.7; }
    }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #0f172a; }
    ::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 3px; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    /* System nervous system — auto-generated from body connections */
    const { useState, useEffect, useRef, useCallback, useMemo } = React;
    const { ReactFlow, ReactFlowProvider, Background, Controls, MiniMap, Panel, Handle, Position } = window.ReactFlow;
  </script>
</body>
</html>`;
  }

  // ============================================================
  // GROW ORGANS
  // Each organ is a page/cluster of components that share
  // a circuit type (Individual/Collective/Tribal)
  // ============================================================
  growOrgans(body) {
    const organs = [];

    // Group components by circuit (gate determines circuit)
    const circuitGroups = new Map();
    for (const organ of body.organs) {
      for (const comp of organ.components) {
        const gate = comp.dimensions.gate;
        const circuit = this.getCircuitForGate(gate);
        if (!circuitGroups.has(circuit)) {
          circuitGroups.set(circuit, []);
        }
        circuitGroups.get(circuit).push({ ...comp, organ: organ.name });
      }
    }

    // Create a page for each circuit group
    for (const [circuit, components] of circuitGroups.entries()) {
      const pageType = BodyArchitecture.PAGE_TYPES[circuit] || BodyArchitecture.PAGE_TYPES['Individual'];

      // The page's visual properties come from the dominant component
      const dominant = this.findDominantComponent(components);
      const theme = BodyArchitecture.THEMES[dominant.dimensions.color] || BodyArchitecture.THEMES[3];
      const depth = BodyArchitecture.DEPTH[dominant.dimensions.line] || BodyArchitecture.DEPTH[4];
      const renderMode = BodyArchitecture.RENDER_MODES[dominant.dimensions.tone] || BodyArchitecture.RENDER_MODES[4];

      const page = {
        id: `page_${circuit.toLowerCase()}`,
        circuit,
        title: `${circuit} Circuit — ${dominant.dimensions.gate}:${this.getGateName(dominant.dimensions.gate)}`,
        layout: pageType.layout,
        nav: pageType.nav,
        animation: pageType.animation,
        theme,
        depth,
        renderMode,
        components: components.map((c, i) => this.renderComponent(c, i, theme, depth, renderMode)),
        connections: this.findComponentConnections(components, body.connections)
      };

      organs.push(page);
      this.pages.set(page.id, page);
    }

    // Always create a "System Body" overview page
    const overviewPage = this.createOverviewPage(body);
    organs.unshift(overviewPage);
    this.pages.set(overviewPage.id, overviewPage);

    return organs;
  }

  getCircuitForGate(gateNum) {
    // Individual Circuit gates: 1, 2, 3, 10, 57, 28, 38, 54, 61, etc.
    const individual = [1, 2, 3, 10, 57, 28, 38, 54, 61, 39, 51, 55, 56, 60];
    // Collective Circuit gates: 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, etc.
    const collective = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 30, 31, 32, 33, 34, 35, 36, 37, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 52, 53, 58, 59, 62, 63, 64];

    if (individual.includes(gateNum)) return 'Individual';
    // Tribal: 4, 5, 6, 7, 8, 9
    if ([4, 5, 6, 7, 8, 9].includes(gateNum)) return 'Tribal';
    return 'Collective';
  }

  getGateName(gateNum) {
    const names = {
      1: 'Creative', 2: 'Receptive', 3: 'Difficulty', 4: 'Youthful Folly',
      5: 'Waiting', 6: 'Conflict', 7: 'The Army', 8: 'Holding Together',
      9: 'The Taming Power', 10: 'Treading', 11: 'Peace', 12: 'Standstill',
      13: 'Fellowship', 14: 'Possession', 15: 'Modesty', 16: 'Enthusiasm',
      57: 'The Gentle'
    };
    return names[gateNum] || `Gate ${gateNum}`;
  }

  findDominantComponent(components) {
    // Find the component with highest field strength
    let best = components[0];
    let bestStrength = 0;
    for (const c of components) {
      const strength = this.engine.resonanceField.get(c.address) || 0;
      if (strength > bestStrength) {
        bestStrength = strength;
        best = c;
      }
    }
    return best;
  }

  // ============================================================
  // RENDER COMPONENT
  // Each component becomes a React node with morphological properties
  // ============================================================
  renderComponent(component, index, theme, depth, renderMode) {
    const { type, address, dimensions } = component;
    const { base, tone, color, gate, line } = dimensions;

    const region = BodyArchitecture.REGIONS[base] || BodyArchitecture.REGIONS[3];
    const compDepth = BodyArchitecture.DEPTH[line] || BodyArchitecture.DEPTH[4];

    // Generate a unique component ID
    const compId = `comp_${type}_${index}_${Date.now()}`;
    this.components.set(compId, component);

    // The component's visual form is determined by its MRNN dimensions
    const styles = {
      background: `radial-gradient(circle at 35% 35%, ${theme.accent}33, ${theme.primary}dd)`,
      border: `2px solid ${theme.primary}`,
      boxShadow: `0 0 ${15 + base * 5}px ${theme.glow}, inset 0 0 ${8 + line * 3}px ${theme.primary}55`,
      borderRadius: this.getBorderRadius(type),
      transform: `scale(${compDepth.scale})`,
      opacity: compDepth.opacity,
      zIndex: compDepth.zIndex,
      transition: renderMode.transition,
      cursor: renderMode.interaction === 'none' ? 'default' : 'pointer',
      padding: '16px',
      minWidth: '200px',
      minHeight: '120px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: '12px',
      color: '#e5e7eb'
    };

    // Component content is based on type
    const content = this.generateComponentContent(component, theme);

    return {
      id: compId,
      type,
      address,
      dimensions,
      styles,
      content,
      region: region.region,
      interactions: renderMode.interaction,
      animation: region.position === 'dynamic' ? 'morph-pulse' : 'none'
    };
  }

  getBorderRadius(type) {
    if (type === 'movement_node') return '50%';
    if (type === 'evolution_edge') return '4px';
    if (type === 'being_container') return '12px';
    if (type === 'design_pattern') return '8px';
    if (type === 'space_field') return '30% 70% 70% 30% / 30% 30% 70% 70%';
    return '12px';
  }

  generateComponentContent(component, theme) {
    const { type, address, dimensions } = component;
    const gateName = this.getGateName(dimensions.gate);

    return `
      <div style="text-align:center;">
        <div style="font-size:10px; color:${theme.accent}; text-transform:uppercase; letter-spacing:2px; margin-bottom:8px;">
          ${type.replace('_', ' ')}
        </div>
        <div style="font-size:14px; font-weight:bold; color:${theme.primary}; margin-bottom:4px;">
          ${gateName}
        </div>
        <div style="font-size:9px; color:#6b7280; font-family:monospace;">
          ${address}
        </div>
        <div style="margin-top:8px; display:flex; gap:4px; justify-content:center;">
          <span style="background:${theme.primary}33; color:${theme.primary}; padding:2px 6px; border-radius:3px; font-size:8px;">B${dimensions.base}</span>
          <span style="background:${theme.primary}33; color:${theme.primary}; padding:2px 6px; border-radius:3px; font-size:8px;">T${dimensions.tone}</span>
          <span style="background:${theme.primary}33; color:${theme.primary}; padding:2px 6px; border-radius:3px; font-size:8px;">C${dimensions.color}</span>
        </div>
      </div>
    `;
  }

  findComponentConnections(components, bodyConnections) {
    const connections = [];
    const compNames = components.map(c => c.organ);

    for (const conn of bodyConnections) {
      if (compNames.includes(conn.from) && compNames.includes(conn.to)) {
        connections.push({
          from: conn.from,
          to: conn.to,
          strength: conn.strength,
          type: conn.strength > 0.7 ? 'strong' : 'weak'
        });
      }
    }

    return connections;
  }

  // ============================================================
  // CREATE OVERVIEW PAGE
  // The "brain" of the website — shows the whole system body
  // ============================================================
  createOverviewPage(body) {
    const current = this.engine.currentState || { base: 3, tone: 4, color: 3, gate: 57, line: 4 };
    const theme = BodyArchitecture.THEMES[current.color] || BodyArchitecture.THEMES[3];

    return {
      id: 'page_overview',
      circuit: 'System',
      title: 'MRNN System Body',
      layout: 'radial',
      nav: 'constellation',
      animation: 'orbit',
      theme,
      depth: BodyArchitecture.DEPTH[6],
      renderMode: BodyArchitecture.RENDER_MODES[4],
      isOverview: true,
      components: body.organs.map((organ, i) => ({
        id: `organ_${i}`,
        type: 'being_container',
        address: organ.addresses[0] || 'B3.T4.C3.G57.L4',
        dimensions: { base: 3, tone: 4, color: 3, gate: 57, line: 4 },
        styles: {
          background: `radial-gradient(circle at 35% 35%, ${theme.accent}33, ${theme.primary}dd)`,
          border: `2px solid ${theme.primary}`,
          boxShadow: `0 0 20px ${theme.glow}`,
          borderRadius: '12px',
          padding: '20px',
          minWidth: '240px',
          minHeight: '160px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        },
        content: `
          <div style="text-align:center;">
            <div style="font-size:16px; font-weight:bold; color:${theme.primary}; margin-bottom:8px;">${organ.name}</div>
            <div style="font-size:10px; color:#9ca3af; margin-bottom:4px;">${organ.components.length} components</div>
            <div style="font-size:10px; color:${theme.accent};">Vitality: ${(organ.vitality * 100).toFixed(1)}%</div>
            <div style="margin-top:8px; display:flex; gap:4px; flex-wrap:wrap; justify-content:center;">
              ${organ.components.slice(0, 5).map(c => 
                `<span style="background:${theme.primary}22; color:${theme.primary}; padding:2px 6px; border-radius:3px; font-size:8px;">${c.type}</span>`
              ).join('')}
            </div>
          </div>
        `,
        region: 'heart',
        interactions: 'click',
        animation: 'morph-pulse'
      })),
      connections: body.connections.map(c => ({
        from: c.from,
        to: c.to,
        strength: c.strength,
        type: c.strength > 0.5 ? 'crossing' : 'connection'
      }))
    };
  }

  // ============================================================
  // CONNECT TISSUE
  // Routes, imports, and message-passing channels between organs
  // ============================================================
  connectTissue(body, organs) {
    const tissue = {
      routes: [],
      imports: [],
      messageChannels: []
    };

    // Generate routes based on organ connections
    for (const organ of organs) {
      tissue.routes.push({
        path: `/${organ.id.replace('page_', '')}`,
        component: organ.id,
        title: organ.title
      });

      // Cross-organ connections become navigation links
      for (const conn of organ.connections || []) {
        const targetOrgan = organs.find(o => o.id.includes(conn.to.toLowerCase().replace(/\s/g, '_')));
        if (targetOrgan) {
          tissue.messageChannels.push({
            from: organ.id,
            to: targetOrgan.id,
            strength: conn.strength,
            type: conn.type
          });
        }
      }
    }

    // Add home route
    tissue.routes.unshift({
      path: '/',
      component: 'page_overview',
      title: 'System Body'
    });

    this.routes = tissue.routes;
    return tissue;
  }

  // ============================================================
  // GROW SKIN
  // CSS generated from the system's current color/tone state
  // The skin changes as the system evolves
  // ============================================================
  growSkin(body) {
    const current = this.engine.currentState || { base: 3, tone: 4, color: 3, gate: 57, line: 4 };
    const theme = BodyArchitecture.THEMES[current.color] || BodyArchitecture.THEMES[3];
    const renderMode = BodyArchitecture.RENDER_MODES[current.tone] || BodyArchitecture.RENDER_MODES[4];

    const skin = `
/* MRNN System Skin — Auto-generated from body state */
/* Current: B${current.base}.T${current.tone}.C${current.color}.G${current.gate}.L${current.line} */

:root {
  --primary: ${theme.primary};
  --secondary: ${theme.secondary};
  --accent: ${theme.accent};
  --glow: ${theme.glow};
  --bg-deep: #0f172a;
  --bg-surface: #1e293b;
  --text-primary: #e5e7eb;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;
  --border: rgba(75, 85, 99, 0.5);
  --transition: ${renderMode.transition};
}

.system-body {
  background: var(--bg-deep);
  color: var(--text-primary);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  min-height: 100vh;
  transition: var(--transition);
}

.organ-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 2rem;
  justify-content: center;
  align-items: flex-start;
}

.component-node {
  background: radial-gradient(circle at 35% 35%, var(--accent)33, var(--primary)dd);
  border: 2px solid var(--primary);
  box-shadow: 0 0 20px var(--glow);
  border-radius: 12px;
  padding: 16px;
  min-width: 200px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
  cursor: pointer;
  position: relative;
  animation: field-breathe 4s ease infinite;
}

.component-node:hover {
  transform: scale(1.08);
  box-shadow: 0 0 40px var(--glow);
  z-index: 100;
}

.connection-edge {
  stroke: var(--primary);
  stroke-width: 2;
  opacity: 0.6;
  transition: var(--transition);
}

.connection-edge.strong {
  stroke-width: 3;
  opacity: 0.9;
  filter: drop-shadow(0 0 4px var(--glow));
}

.nav-constellation {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
}

.nav-constellation a {
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 16px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 11px;
  transition: var(--transition);
  backdrop-filter: blur(12px);
}

.nav-constellation a:hover {
  color: var(--primary);
  border-color: var(--primary);
  box-shadow: 0 0 12px var(--glow);
}

.field-overlay {
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  color: var(--text-primary);
  font-size: 12px;
  z-index: 1000;
  min-width: 220px;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}

.vitality-bar {
  width: 100%;
  height: 4px;
  background: rgba(75, 85, 99, 0.3);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
}

.vitality-bar-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 2px;
  transition: width 0.5s ease;
}
`;

    this.globalStyles = skin;
    return skin;
  }

  // ============================================================
  // BUILD NERVOUS SYSTEM
  // JavaScript for inter-component communication
  // ============================================================
  buildNervousSystem(body, organs) {
    const channels = [];

    for (const conn of body.connections) {
      channels.push({
        from: conn.from,
        to: conn.to,
        strength: conn.strength,
        handler: this.generateMessageHandler(conn)
      });
    }

    return {
      channels,
      eventBus: this.generateEventBus(),
      stateManager: this.generateStateManager(body)
    };
  }

  generateMessageHandler(connection) {
    return `
      // Message channel: ${connection.from} → ${connection.to}
      // Strength: ${(connection.strength * 100).toFixed(1)}%
      function handle_${connection.from.replace(/[^a-zA-Z0-9]/g, '_')}_${connection.to.replace(/[^a-zA-Z0-9]/g, '_')}(payload) {
        const threshold = ${connection.strength.toFixed(3)};
        if (payload.intensity >= threshold) {
          propagate('${connection.to}', payload);
          return { propagated: true, attenuation: ${(1 - connection.strength).toFixed(3)} };
        }
        return { propagated: false, reason: 'below_threshold' };
      }
    `;
  }

  generateEventBus() {
    return `
      // MRNN Event Bus — Nervous system message passing
      const EventBus = {
        channels: new Map(),
        subscribe(channel, handler) {
          if (!this.channels.has(channel)) this.channels.set(channel, []);
          this.channels.get(channel).push(handler);
        },
        emit(channel, payload) {
          const handlers = this.channels.get(channel) || [];
          handlers.forEach(h => {
            try { h(payload); } catch(e) { console.warn('Channel error:', e); }
          });
        },
        propagate(target, payload) {
          this.emit(target, { ...payload, hops: (payload.hops || 0) + 1 });
        }
      };
    `;
  }

  generateStateManager(body) {
    return `
      // MRNN State Manager — Maintains system coherence
      const SystemState = {
        organs: ${JSON.stringify(body.organs.map(o => ({ name: o.name, vitality: o.vitality })))},
        vitality: ${body.vitality.toFixed(4)},
        connections: ${body.connectionCount},
        tick: ${this.buildCount},
        updateVitality() {
          const avg = this.organs.reduce((s, o) => s + o.vitality, 0) / this.organs.length;
          this.vitality = avg;
          document.querySelector('.vitality-bar-fill')?.style.setProperty('width', (avg * 100) + '%');
        }
      };
    `;
  }

  // ============================================================
  // ASSEMBLE BODY
  // Put all parts together into the final HTML
  // ============================================================
  assembleBody(skeleton, organs, tissue, skin, nervousSystem) {
    // Build the React app code
    const reactApp = this.generateReactApp(organs, tissue, nervousSystem);

    // Inject into skeleton
    const assembled = skeleton.replace(
      '<script type="text/babel">',
      `<style>${skin}</style>\n  <script type="text/babel">\n    ${nervousSystem.eventBus}\n    ${nervousSystem.stateManager}\n    ${reactApp}`
    );

    return { html: assembled, organs, tissue, skin, reactApp };
  }

  generateReactApp(organs, tissue) {
    // Generate React components for each organ/page
    const pageComponents = organs.map(organ => {
      const compCode = organ.components.map((c, i) => `
        <div key="${c.id}" 
             className="component-node"
             style={${JSON.stringify(c.styles)}}
             onClick={() => EventBus.emit('activate_${c.id}', { intensity: 0.8 })}>
          ${c.content}
        </div>
      `).join('\n');

      return `
        const ${organ.id} = () => {
          const [active, setActive] = useState(null);
          useEffect(() => {
            EventBus.subscribe('navigate', (payload) => {
              if (payload.target === '${organ.id}') setActive(payload);
            });
          }, []);
          return (
            <div className="system-body" style={{ padding: '2rem' }}>
              <h1 style={{ color: '${organ.theme.primary}', textAlign: 'center', marginBottom: '2rem', fontSize: '1.5rem' }}>
                ${organ.title}
              </h1>
              <div className="organ-container">
                ${compCode}
              </div>
            </div>
          );
        };
      `;
    }).join('\n');

    // Navigation component
    const navComponent = `
      const SystemNav = () => {
        const [current, setCurrent] = useState('page_overview');
        return (
          <div className="nav-constellation">
            ${tissue.routes.map(r => `
              <a href="#" onClick={(e) => { e.preventDefault(); setCurrent('${r.component}'); EventBus.emit('navigate', { target: '${r.component}' }); }}>
                ${r.title}
              </a>
            `).join('')}
          </div>
        );
      };
    `;

    // Field overlay component
    const overlayComponent = `
      const FieldOverlay = () => {
        const [vitality, setVitality] = useState(SystemState.vitality);
        useEffect(() => {
          const interval = setInterval(() => {
            SystemState.updateVitality();
            setVitality(SystemState.vitality);
          }, 2000);
          return () => clearInterval(interval);
        }, []);
        return (
          <div className="field-overlay">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
              <span style={{ fontSize: 16 }}>⚡</span>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: 13 }}>SYSTEM BODY</span>
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Build</span>
                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>#${this.buildCount + 1}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Organs</span>
                <span>${organs.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Components</span>
                <span>${this.components.size}</span>
              </div>
              <div style={{ marginTop: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Vitality</span>
                  <span style={{ color: vitality > 0.5 ? 'var(--primary)' : '#ef4444', fontWeight: 'bold' }}>
                    ${'${(vitality * 100).toFixed(1)}'}%
                  </span>
                </div>
                <div className="vitality-bar">
                  <div className="vitality-bar-fill" style={{ width: '${'${(vitality * 100).toFixed(0)}'}%' }} />
                </div>
              </div>
            </div>
          </div>
        );
      };
    `;

    // Main app router
    const appComponent = `
      const App = () => {
        const [page, setPage] = useState('page_overview');
        useEffect(() => {
          EventBus.subscribe('navigate', (payload) => setPage(payload.target));
        }, []);
        return (
          <ReactFlowProvider>
            <div style={{ width: '100vw', minHeight: '100vh', background: 'var(--bg-deep)' }}>
              <SystemNav />
              <FieldOverlay />
              {page === 'page_overview' && <${organs[0]?.id || 'div'} />}
              ${organs.slice(1).map(o => `{page === '${o.id}' && <${o.id} />}`).join('\n              ')}
            </div>
          </ReactFlowProvider>
        );
      };
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(<App />);
    `;

    return pageComponents + navComponent + overlayComponent + appComponent;
  }

  // ============================================================
  // WRITE TO DISK
  // ============================================================
  async writeToDisk(assembled) {
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Write main HTML
    fs.writeFileSync(path.join(this.outputDir, 'index.html'), assembled.html);

    // Write component manifest
    const manifest = {
      buildCount: this.buildCount + 1,
      pages: Array.from(this.pages.values()).map(p => ({
        id: p.id,
        title: p.title,
        circuit: p.circuit,
        componentCount: p.components.length
      })),
      components: Array.from(this.components.entries()).map(([id, comp]) => ({
        id,
        type: comp.type,
        address: comp.address,
        dimensions: comp.dimensions
      })),
      routes: this.routes,
      generatedAt: new Date().toISOString(),
      vitality: assembled.organs.reduce((s, o) => s + (o.vitality || 0), 0) / (assembled.organs.length || 1)
    };

    fs.writeFileSync(
      path.join(this.outputDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    console.log(`   → Written: ${path.join(this.outputDir, 'index.html')}`);
    console.log(`   → Manifest: ${path.join(this.outputDir, 'manifest.json')}`);
  }

  // ============================================================
  // INCREMENTAL SCAFFOLD
  // Rebuild only what changed (like cellular regeneration)
  // ============================================================
  async incrementalScaffold(changedFiles) {
    console.log('\n🔄 INCREMENTAL SCAFFOLD: Regenerating affected organs...');

    for (const file of changedFiles) {
      const memory = this.ingestion.structuralMemory.get(file);
      if (memory) {
        // Find which organs contain this file's components
        for (const [pageId, page] of this.pages.entries()) {
          const affected = page.components.filter(c => 
            memory.addresses.includes(c.address)
          );
          if (affected.length > 0) {
            console.log(`   → Regenerating ${pageId} (${affected.length} affected components)`);
            // Re-render affected components
            // (In a full implementation, this would patch the DOM)
          }
        }
      }
    }

    // Full rebuild if too many changes
    if (changedFiles.length > 3) {
      return this.scaffold();
    }

    return { incremental: true, changedFiles: changedFiles.length };
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MRNNSelfScaffold, BodyArchitecture };
}
