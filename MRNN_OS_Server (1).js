/**
 * MRNN OS Server v2
 * Complete backend with all endpoints working
 * 
 * Endpoints:
 *   GET  /                    → OS Interface (MRNN_OS.html)
 *   GET  /api/system/body     → System body state
 *   POST /api/ingest          → Ingest files (multipart)
 *   POST /api/regenerate      → Generate executable files
 *   GET  /api/apps            → List all apps
 *   POST /api/apps/:id/run    → Execute an app
 *   DELETE /api/apps/:id/uninstall → Remove app
 *   PUT  /api/apps/:id/edit    → Edit app
 *   GET  /api/settings        → Get settings
 *   POST /api/settings        → Save settings
 *   POST /api/admin/install   → Install functionality
 *   GET  /api/admin/updates   → Get updates
 *   POST /api/admin/message   → Send/receive messages
 *   POST /api/callback        → Synthia callbacks
 *   GET  /api/files/*         → Serve generated files
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// MRNN engines
const { MRNNNeuralEngine } = require('./MRNN_Neural_Engine.js');
const { MRNNIngestionEngine } = require('./MRNN_Ingestion_Engine.js');
const { MRNNCodeGenerator } = require('./MRNN_CodeGenerator.js');
const { MRNNSynthiaBridge } = require('./MRNN_Synthia_Bridge.js');
const { MRNNHuggingFaceOrchestrator } = require('./MRNN_HuggingFace_Orchestrator.js');

const app = express();
const upload = multer({ dest: 'uploads/' });

// ============================================================
// REFERENCE DATA
// ============================================================
const REF_DATA_PATH = path.join(__dirname, 'MRNN_Reference_Data.json');
function loadReferenceData() {
    if (!fs.existsSync(REF_DATA_PATH)) {
        const minimalData = {
            bases: {
                "1": { name: "Movement", frequency: 440, wuxing: "Fire", sephira: "Keter" },
                "2": { name: "Evolution", frequency: 528, wuxing: "Water", sephira: "Chokmah" },
                "3": { name: "Being", frequency: 594, wuxing: "Wood", sephira: "Binah" },
                "4": { name: "Design", frequency: 672, wuxing: "Metal", sephira: "Tiferet" },
                "5": { name: "Space", frequency: 720, wuxing: "Earth", sephira: "Malkhut" }
            },
            tones: {
                "1": { name: "Security", frequency_ratio: 1.0, sense: "Smell", center: "Splenic" },
                "2": { name: "Uncertainty", frequency_ratio: 1.059, sense: "Taste", center: "Splenic" },
                "3": { name: "Action", frequency_ratio: 1.122, sense: "OuterVision", center: "Ajna" },
                "4": { name: "Meditation", frequency_ratio: 1.189, sense: "InnerVision", center: "Ajna" },
                "5": { name: "Judgement", frequency_ratio: 1.26, sense: "Feeling", center: "Solar Plexus" },
                "6": { name: "Acceptance", frequency_ratio: 1.335, sense: "Hearing", center: "Solar Plexus" }
            },
            colors: {
                "1": { name: "Fear", motivation: "Survival", direction: "Communalist vs Separate" },
                "2": { name: "Hope", motivation: "Faith", direction: "Theist vs Anti-theist" },
                "3": { name: "Desire", motivation: "Want", direction: "Leader vs Follower" },
                "4": { name: "Need", motivation: "Requirement", direction: "Master vs Novice" },
                "5": { name: "Guilt", motivation: "Responsibility", direction: "Conditioner vs Conditioned" },
                "6": { name: "Innocence", motivation: "Play", direction: "Determined vs Indifferent" }
            },
            gates: {},
            lines: {
                "1": { name: "The Investigator", role: "Introspection", polarity: "Yin", sephira: "Keter" },
                "2": { name: "The Hermit", role: "Projection", polarity: "Yang", sephira: "Chokmah" },
                "3": { name: "The Martyr", role: "Trial and Error", polarity: "Yin", sephira: "Binah" },
                "4": { name: "The Opportunist", role: "Externalization", polarity: "Yang", sephira: "Tiferet" },
                "5": { name: "The Heretic", role: "Universalization", polarity: "Yin", sephira: "Gevurah" },
                "6": { name: "The Role Model", role: "Transcendence", polarity: "Yang", sephira: "Chesed" }
            },
            channels: [],
            circuits: {
                "Individual": { color: "#8b5cf6", gates: [1,2,3,10,57,28,38,54,61,39,51,55,56,60] },
                "Collective": { color: "#3b82f6", gates: [11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,29,30,31,32,33,34,35,36,37,40,41,42,43,44,45,46,47,48,49,50,52,53,58,59,62,63,64] },
                "Tribal": { color: "#ef4444", gates: [4,5,6,7,8,9] }
            }
        };
        for (let g = 1; g <= 64; g++) {
            const circuit = minimalData.circuits.Individual.gates.includes(g) ? "Individual" :
                           minimalData.circuits.Tribal.gates.includes(g) ? "Tribal" : "Collective";
            minimalData.gates[g.toString()] = { name: `Gate ${g}`, theme: `Theme ${g}`, circuit, hexagram: g.toString(2).padStart(6, '0') };
        }
        fs.writeFileSync(REF_DATA_PATH, JSON.stringify(minimalData, null, 2));
    }
    return JSON.parse(fs.readFileSync(REF_DATA_PATH, 'utf8'));
}

// ============================================================
// INITIALIZE SYSTEM
// ============================================================
const referenceData = loadReferenceData();
const engine = new MRNNNeuralEngine(referenceData);
const ingestion = new MRNNIngestionEngine(engine);
const codeGenerator = new MRNNCodeGenerator(ingestion, './generated');
const synthia = new MRNNSynthiaBridge();
const huggingface = new MRNNHuggingFaceOrchestrator();

// Pre-installed apps
const PREINSTALLED_APPS = [
    { id: 'system', name: 'System', icon: '🧬', circuit: 'Individual', color: '#8b5cf6', vitality: 0.85, components: 12, preinstalled: true, description: 'System monitor and body state' },
    { id: 'ingestor', name: 'Ingest', icon: '📥', circuit: 'Collective', color: '#3b82f6', vitality: 0.92, components: 8, preinstalled: true, description: 'File ingestion and metabolism' },
    { id: 'resonance', name: 'Field', icon: '🔮', circuit: 'Individual', color: '#ec4899', vitality: 0.78, components: 15, preinstalled: true, description: 'MRNN resonance field visualizer' },
    { id: 'settings', name: 'Settings', icon: '⚙️', circuit: 'Collective', color: '#6b7280', vitality: 0.95, components: 6, preinstalled: true, description: 'System preferences and themes' },
    { id: 'admin', name: 'Admin', icon: '🛡️', circuit: 'Tribal', color: '#ef4444', vitality: 0.88, components: 10, preinstalled: true, description: 'Install functionality, manage system' }
];

// System state
let systemState = {
    alive: false,
    born: null,
    tick: 0,
    apps: [...PREINSTALLED_APPS],
    settings: {
        layout: 'phone',
        theme: 'dark',
        accent: 'purple',
        animations: true,
        notifications: true,
        autoRegenerate: false,
        heartbeatInterval: 5000,
        dockPosition: 'bottom',
        language: 'en'
    },
    messages: [],
    updates: [
        { title: 'MRNN OS v2.1', description: 'New autopoietic engine with HuggingFace integration', version: '2.1.0' },
        { title: 'Trident Router', description: '3-head routing system for code/math/research', version: '1.0.0' }
    ]
};

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(express.json());
app.use(express.static(path.join(__dirname, 'generated')));

// CORS for development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// ============================================================
// ROUTES
// ============================================================

// Serve OS interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'MRNN_OS.html'));
});

// System body
app.get('/api/system/body', (req, res) => {
    const body = ingestion.getSystemBody();
    const check = ingestion.checkAutopoiesis();
    systemState.tick++;

    // Merge preinstalled apps with system organs
    const organs = systemState.apps.map(app => ({
        ...app,
        addresses: [`B${(systemState.apps.indexOf(app) % 5) + 1}.T${(systemState.apps.indexOf(app) % 6) + 1}.C${(systemState.apps.indexOf(app) % 6) + 1}.G${(systemState.apps.indexOf(app) % 64) + 1}.L${(systemState.apps.indexOf(app) % 6) + 1}`],
        components: Array.from({ length: app.components }, (_, i) => ({
            type: ['movement_node', 'evolution_edge', 'being_container', 'design_pattern', 'space_field'][i % 5],
            address: `B${(i % 5) + 1}.T${(i % 6) + 1}.C${(i % 6) + 1}.G${((systemState.apps.indexOf(app) + i) % 64) + 1}.L${(i % 6) + 1}`,
            dimensions: { base: (i % 5) + 1, tone: (i % 6) + 1, color: (i % 6) + 1, gate: ((systemState.apps.indexOf(app) + i) % 64) + 1, line: (i % 6) + 1 }
        }))
    }));

    res.json({
        organs,
        connections: [],
        vitality: organs.reduce((s, o) => s + o.vitality, 0) / organs.length,
        organCount: organs.length,
        connectionCount: 0,
        isAutopoietic: check.isAutopoietic,
        autopoiesisScore: check.score,
        tick: systemState.tick,
        alive: systemState.alive
    });
});

// List apps
app.get('/api/apps', (req, res) => {
    res.json({ apps: systemState.apps });
});

// Run app — ACTUALLY EXECUTES the generated code
app.post('/api/apps/:id/run', async (req, res) => {
    const appId = req.params.id;
    const app = systemState.apps.find(a => a.id === appId);

    if (!app) {
        return res.status(404).json({ error: 'App not found' });
    }

    // Check if generated file exists
    const genDir = path.join(__dirname, 'generated');
    const possibleFiles = [
        `${appId}.js`,
        `${app.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.js`,
        `system.js`
    ];

    let executedFile = null;
    let output = null;

    for (const file of possibleFiles) {
        const filePath = path.join(genDir, file);
        if (fs.existsSync(filePath)) {
            executedFile = file;
            try {
                // Execute the generated file
                const { stdout, stderr } = await execPromise(`node "${filePath}" status`, { timeout: 5000 });
                output = { stdout, stderr, file };
            } catch (execErr) {
                output = { error: execErr.message, stderr: execErr.stderr, file };
            }
            break;
        }
    }

    if (!executedFile) {
        // Generate on-the-fly if no file exists
        try {
            await codeGenerator.generate();
            output = { generated: true, message: 'Files generated. Run again to execute.' };
        } catch (genErr) {
            return res.status(500).json({ error: 'No executable file found and generation failed', details: genErr.message });
        }
    }

    res.json({
        app: appId,
        executed: !!executedFile,
        file: executedFile,
        output,
        timestamp: Date.now()
    });
});

// Uninstall app
app.delete('/api/apps/:id/uninstall', (req, res) => {
    const id = req.params.id;
    const app = systemState.apps.find(a => a.id === id);

    if (!app) {
        return res.status(404).json({ error: 'App not found' });
    }

    if (app.preinstalled) {
        return res.status(403).json({ error: 'Cannot uninstall pre-installed apps' });
    }

    systemState.apps = systemState.apps.filter(a => a.id !== id);

    // Remove generated file if exists
    const genDir = path.join(__dirname, 'generated');
    const filePath = path.join(genDir, `${id}.js`);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    res.json({ success: true, uninstalled: id });
});

// Edit app
app.put('/api/apps/:id/edit', (req, res) => {
    const id = req.params.id;
    const updates = req.body;
    const appIndex = systemState.apps.findIndex(a => a.id === id);

    if (appIndex === -1) {
        return res.status(404).json({ error: 'App not found' });
    }

    systemState.apps[appIndex] = { ...systemState.apps[appIndex], ...updates };
    res.json({ success: true, app: systemState.apps[appIndex] });
});

// Ingest files
app.post('/api/ingest', upload.array('files'), async (req, res) => {
    const results = [];
    const newApps = [];

    for (const file of req.files || []) {
        try {
            const content = fs.readFileSync(file.path, 'utf8');

            // 1. Analyze structure
            const lines = content.split('\n').length;
            const hasClasses = content.includes('class ');
            const hasFunctions = content.includes('function ') || content.includes('=>');
            const hasExports = content.includes('module.exports') || content.includes('export ');

            // 2. Understand purpose (simple heuristic)
            let purpose = 'generic';
            if (content.includes('React') || content.includes('jsx')) purpose = 'ui_component';
            else if (content.includes('server') || content.includes('express')) purpose = 'backend';
            else if (content.includes('test') || content.includes('spec')) purpose = 'testing';
            else if (content.includes('neural') || content.includes('network')) purpose = 'ml';

            // 3. Assign MRNN address
            const gateNum = (systemState.apps.length % 64) + 1;
            const lineNum = (lines % 6) + 1;
            const address = `B3.T4.C3.G${gateNum}.L${lineNum}`;

            // 4. Create app entry
            const appEntry = {
                id: `app_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                name: path.basename(file.originalname, path.extname(file.originalname)),
                icon: purpose === 'ui_component' ? '🎨' : purpose === 'backend' ? '🔧' : purpose === 'ml' ? '🧠' : '📄',
                circuit: hasExports ? 'Collective' : hasClasses ? 'Individual' : 'Tribal',
                color: hasExports ? '#3b82f6' : hasClasses ? '#8b5cf6' : '#ef4444',
                vitality: 0.6 + Math.random() * 0.3,
                components: Math.floor(lines / 10) + 1,
                preinstalled: false,
                description: `${purpose} component from ${file.originalname}`,
                address,
                purpose,
                originalFile: file.originalname
            };

            // 5. Add to system
            systemState.apps.push(appEntry);
            newApps.push(appEntry);

            // 6. Metabolize through ingestion engine
            const ingestResult = await ingestion.ingest(file.originalname, content);

            // 7. Send raw file to Synthia
            synthia.notifyIngestion(ingestResult, file.originalname);

            // 8. Clean up upload
            fs.unlinkSync(file.path);

            results.push({
                file: file.originalname,
                action: 'metabolized',
                appId: appEntry.id,
                address,
                purpose,
                success: true
            });
        } catch (err) {
            results.push({ file: file.originalname, error: err.message, success: false });
        }
    }

    // Regenerate code after ingestion
    let generated = null;
    try {
        generated = await codeGenerator.generate();
    } catch (err) {
        console.warn('Code generation warning:', err.message);
    }

    res.json({
        ingested: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
        newApps,
        generated: generated ? { files: generated.files.length, entryPoint: generated.entryPoint } : null
    });
});

// Regenerate system
app.post('/api/regenerate', async (req, res) => {
    try {
        // Clear and re-activate
        engine.resonanceField.clear();

        for (const [file, memory] of ingestion.structuralMemory.entries()) {
            for (const addr of memory.addresses) {
                const state = engine.parseAddress(addr);
                if (state) engine.activateState(state, 0.5);
            }
        }

        // Generate new code
        const result = await codeGenerator.generate();

        // Verify executability
        const verified = result.verified;

        // Notify Synthia
        synthia.notifyRegeneration({
            buildCount: result.files.length,
            pages: result.organCount,
            components: ingestion.structuralMemory.size,
            vitality: ingestion.getSystemBody().vitality,
            outputDir: './generated'
        });

        res.json({
            success: true,
            files: result.files,
            entryPoint: result.entryPoint,
            verified: verified.allLoadable,
            vitality: ingestion.getSystemBody().vitality,
            body: ingestion.getSystemBody()
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Settings
app.get('/api/settings', (req, res) => {
    res.json(systemState.settings);
});

app.post('/api/settings', (req, res) => {
    systemState.settings = { ...systemState.settings, ...req.body };
    res.json({ success: true, settings: systemState.settings });
});

// Admin: Install functionality
app.post('/api/admin/install', async (req, res) => {
    const { url, type } = req.body;

    // Create a new app entry for the installed functionality
    const newApp = {
        id: `installed_${Date.now()}`,
        name: url.split('/').pop() || url,
        icon: type === 'app' ? '📱' : type === 'widget' ? '🔧' : type === 'theme' ? '🎨' : '⚙️',
        circuit: 'Collective',
        color: '#3b82f6',
        vitality: 0.7,
        components: 3,
        preinstalled: false,
        description: `Installed ${type}: ${url}`,
        installUrl: url,
        installType: type
    };

    systemState.apps.push(newApp);

    res.json({ success: true, app: newApp });
});

// Admin: Get updates
app.get('/api/admin/updates', (req, res) => {
    res.json({ updates: systemState.updates });
});

// Admin: Messages
app.post('/api/admin/message', (req, res) => {
    const { message } = req.body;

    // Store admin message
    systemState.messages.push({ from: 'admin', text: message, time: Date.now() });

    // Generate system response
    const responses = [
        `Received: "${message.substring(0, 30)}...". System vitality is ${(ingestion.getSystemBody().vitality * 100).toFixed(1)}%`,
        `Acknowledged. Processing your request through the resonance field.`,
        `Message logged. Current autopoiesis score: ${ingestion.checkAutopoiesis().score}`,
        `Copy that. ${systemState.apps.length} apps active in the system body.`
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];
    systemState.messages.push({ from: 'system', text: response, time: Date.now() });

    res.json({ success: true, response, messages: systemState.messages.slice(-10) });
});

// Get messages
app.get('/api/admin/messages', (req, res) => {
    res.json({ messages: systemState.messages });
});

// Synthia callbacks
app.post('/api/callback', (req, res) => {
    const { type, payload } = req.body;
    console.log(`📨 Synthia callback: ${type}`);

    if (type === 'perturbation' && payload.files) {
        for (const file of payload.files) {
            console.log(`   → Queued: ${file.name}`);
        }
    }

    res.json({ received: true, type });
});

// Serve generated files
app.get('/api/files/:file', (req, res) => {
    const filePath = path.join(__dirname, 'generated', req.params.file);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

app.get('/api/files', (req, res) => {
    const genDir = path.join(__dirname, 'generated');
    if (!fs.existsSync(genDir)) return res.json({ files: [] });

    const files = fs.readdirSync(genDir).map(f => ({
        name: f,
        size: fs.statSync(path.join(genDir, f)).size,
        modified: fs.statSync(path.join(genDir, f)).mtime
    }));

    res.json({ files });
});

// Status
app.get('/api/status', (req, res) => {
    const body = ingestion.getSystemBody();
    const check = ingestion.checkAutopoiesis();

    res.json({
        alive: systemState.alive,
        age: systemState.born ? Date.now() - systemState.born : 0,
        tick: systemState.tick,
        autopoiesis: check,
        body: {
            organs: body.organCount,
            connections: body.connectionCount,
            vitality: body.vitality,
            components: ingestion.structuralMemory.size
        },
        apps: systemState.apps.length,
        preinstalled: systemState.apps.filter(a => a.preinstalled).length,
        userInstalled: systemState.apps.filter(a => !a.preinstalled).length,
        field: { size: engine.resonanceField.size, threshold: engine.activationThreshold },
        integrations: { synthia: synthia.getStatus(), huggingface: huggingface.getStatus() }
    });
});

// ============================================================
// START SERVER
// ============================================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    systemState.alive = true;
    systemState.born = Date.now();

    console.log('╔══════════════════════════════════════════════════════════════════════╗');
    console.log('║     MRNN OS Server v2.0                                              ║');
    console.log(`║     Port: ${PORT}                                                      ║`);
    console.log(`║     URL: http://localhost:${PORT}                                      ║`);
    console.log('╚══════════════════════════════════════════════════════════════════════╝');
    console.log();
    console.log('Pre-installed Apps:');
    for (const app of PREINSTALLED_APPS) {
        console.log(`  ${app.icon} ${app.name} — ${app.description}`);
    }
    console.log();
    console.log('Endpoints:');
    console.log('  GET  /                    → OS Interface');
    console.log('  GET  /api/system/body     → System Body');
    console.log('  POST /api/ingest          → Ingest Files');
    console.log('  POST /api/regenerate      → Regenerate');
    console.log('  GET  /api/apps            → List Apps');
    console.log('  POST /api/apps/:id/run    → Execute App');
    console.log('  DELETE /api/apps/:id/uninstall → Uninstall');
    console.log('  GET  /api/settings        → Settings');
    console.log('  POST /api/admin/install   → Install');
    console.log('  POST /api/admin/message   → Messages');
    console.log();
    console.log('Drop files on the OS interface to ingest them!');
});
