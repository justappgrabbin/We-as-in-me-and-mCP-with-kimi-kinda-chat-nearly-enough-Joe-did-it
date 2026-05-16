/**
 * MRNN Autopoietic System — Unified Entry Point
 * 
 * Usage:
 *   node MRNN_Unified_Main.js [command] [args]
 * 
 * Commands:
 *   birth [files...]        — Birth the system from files
 *   ingest <file>           — Ingest a file into the system
 *   scaffold                — Build the website from system body
 *   evolve <generations>    — Run genetic evolution
 *   status                  — Show full system status
 *   autopoiesis             — Run full autopoietic loop
 *   serve                   — Start the built website
 *   interactive             — Interactive mode
 * 
 * Examples:
 *   node MRNN_Unified_Main.js birth ./src/*.js ./src/*.tsx
 *   node MRNN_Unified_Main.js ingest ./new_component.tsx
 *   node MRNN_Unified_Main.js autopoiesis
 *   node MRNN_Unified_Main.js status
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// Load engines
const { MRNNNeuralEngine } = require('./MRNN_Neural_Engine.js');
const { MRNNMCPOrchestrator } = require('./MRNN_MCP_Orchestrator.js');
const { MRNNIngestionEngine } = require('./MRNN_Ingestion_Engine.js');
const { MRNNSelfScaffold } = require('./MRNN_SelfScaffold.js');
const { MRNNAutopoieticEngine } = require('./MRNN_Autopoietic_Engine_v2.js');

// Reference data path
const REF_DATA_PATH = path.join(__dirname, 'MRNN_Reference_Data.json');

function loadReferenceData() {
    if (!fs.existsSync(REF_DATA_PATH)) {
        console.error('❌ MRNN_Reference_Data.json not found!');
        console.log('   Creating minimal reference data...');

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

        // Generate all 64 gates
        for (let g = 1; g <= 64; g++) {
            const circuit = minimalData.circuits.Individual.gates.includes(g) ? "Individual" :
                           minimalData.circuits.Tribal.gates.includes(g) ? "Tribal" : "Collective";
            minimalData.gates[g.toString()] = {
                name: `Gate ${g}`,
                theme: `Theme ${g}`,
                circuit: circuit,
                hexagram: g.toString(2).padStart(6, '0')
            };
        }

        fs.writeFileSync(REF_DATA_PATH, JSON.stringify(minimalData, null, 2));
        console.log('   ✅ Minimal reference data created');
    }

    return JSON.parse(fs.readFileSync(REF_DATA_PATH, 'utf8'));
}

async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'interactive';

    console.log('╔══════════════════════════════════════════════════════════════════════╗');
    console.log('║     MRNN Autopoietic System v2.0                                     ║');
    console.log('║     Self-Scaffolding | Self-Modifying | Self-Producing               ║');
    console.log('║     5 Layers | 69,120 States | TRUE Autopoiesis                      ║');
    console.log('╚══════════════════════════════════════════════════════════════════════╝');
    console.log();

    const referenceData = loadReferenceData();
    let system = null;

    switch (command) {
        case 'birth': {
            const files = args.slice(1).filter(a => !a.startsWith('--'));
            const outputDir = args.find(a => a.startsWith('--out='))?.split('=')[1] || './dist';

            console.log(`🌱 BIRTHING system from ${files.length} files...`);
            console.log(`   Output: ${outputDir}`);

            system = new MRNNAutopoieticEngine(referenceData);
            system.scaffold.outputDir = outputDir;

            const result = await system.birth(files);

            console.log();
            console.log('═══════════════════════════════════════════════════════════════');
            console.log('SYSTEM BORN');
            console.log(`Autopoiesis: ${result.autopoiesis.score}`);
            console.log(`Pages: ${result.scaffold.pages}`);
            console.log(`Components: ${result.scaffold.components}`);
            console.log(`Vitality: ${(result.scaffold.vitality * 100).toFixed(1)}%`);
            console.log(`Output: ${outputDir}/index.html`);
            console.log('═══════════════════════════════════════════════════════════════');
            break;
        }

        case 'ingest': {
            const file = args[1];
            if (!file) {
                console.log('Usage: node MRNN_Unified_Main.js ingest <file>');
                process.exit(1);
            }

            system = new MRNNAutopoieticEngine(referenceData);
            const result = await system.ingestion.ingest(file);

            console.log();
            console.log('═══════════════════════════════════════════════════════════════');
            console.log('INGESTION RESULT');
            console.log(`Action: ${result.action}`);
            console.log(`Message: ${result.message}`);
            if (result.addresses) {
                console.log(`Addresses: ${result.addresses.join(', ')}`);
            }
            console.log('═══════════════════════════════════════════════════════════════');
            break;
        }

        case 'scaffold': {
            const outputDir = args.find(a => a.startsWith('--out='))?.split('=')[1] || './dist';

            system = new MRNNAutopoieticEngine(referenceData);

            // Try to load existing structural memory
            const memoryPath = path.join(outputDir, 'system_memory.json');
            if (fs.existsSync(memoryPath)) {
                const memory = JSON.parse(fs.readFileSync(memoryPath, 'utf8'));
                system.ingestion.structuralMemory = new Map(Object.entries(memory.structuralMemory || {}));
                system.ingestion.boundary = new Set(memory.boundary || []);
                console.log('   → Loaded existing system memory');
            }

            system.scaffold.outputDir = outputDir;
            const result = await system.scaffold.scaffold();

            console.log();
            console.log('═══════════════════════════════════════════════════════════════');
            console.log('SCAFFOLD COMPLETE');
            console.log(`Build #${result.buildCount}`);
            console.log(`Pages: ${result.pages}`);
            console.log(`Components: ${result.components}`);
            console.log(`Vitality: ${(result.vitality * 100).toFixed(1)}%`);
            console.log(`Output: ${outputDir}/index.html`);
            console.log('═══════════════════════════════════════════════════════════════');
            break;
        }

        case 'evolve': {
            const generations = parseInt(args[1]) || 10;

            system = new MRNNAutopoieticEngine(referenceData);

            const scenarios = [
                { start: { base: 1, tone: 1, color: 1, gate: 1, line: 1 },
                  goal: { base: 5, tone: 6, color: 6, gate: 64, line: 6 } },
                { start: { base: 3, tone: 3, color: 3, gate: 30, line: 3 },
                  goal: { base: 3, tone: 4, color: 2, gate: 57, line: 3 } },
                { start: { base: 2, tone: 2, color: 2, gate: 15, line: 2 },
                  goal: { base: 4, tone: 5, color: 4, gate: 40, line: 4 } }
            ];

            const result = await system.evolve(scenarios, generations);

            console.log();
            console.log('═══════════════════════════════════════════════════════════════');
            console.log('EVOLUTION COMPLETE');
            console.log(`Best fitness: ${result.fitness.toFixed(4)}`);
            console.log('═══════════════════════════════════════════════════════════════');
            break;
        }

        case 'autopoiesis':
        case 'auto': {
            const files = args.slice(1).filter(a => !a.startsWith('--') && !a.endsWith('.js'));
            const outputDir = args.find(a => a.startsWith('--out='))?.split('=')[1] || './dist';
            const generations = parseInt(args.find(a => a.startsWith('--gen='))?.split('=')[1]) || 5;
            const maxIter = parseInt(args.find(a => a.startsWith('--max='))?.split('=')[1]) || 20;

            console.log(`🔄 Running full autopoietic loop...`);
            console.log(`   Files: ${files.length}`);
            console.log(`   Generations: ${generations}`);
            console.log(`   Max iterations: ${maxIter}`);
            console.log(`   Output: ${outputDir}`);

            system = new MRNNAutopoieticEngine(referenceData);
            system.scaffold.outputDir = outputDir;

            const result = await system.autopoieticLoop({
                filesToIngest: files,
                generations,
                maxIterations: maxIter,
                autoScaffold: true
            });

            console.log();
            console.log('═══════════════════════════════════════════════════════════════');
            console.log('AUTOPOIETIC LOOP COMPLETE');
            console.log(`Iterations: ${result.iterations}`);
            console.log(`Stable: ${result.isStable}`);
            console.log(`Autopoiesis: ${result.autopoiesis.score}`);
            console.log(`Vitality: ${(result.finalBody.vitality * 100).toFixed(1)}%`);
            console.log(`Output: ${result.outputDir}/index.html`);
            console.log('═══════════════════════════════════════════════════════════════');
            break;
        }

        case 'status': {
            system = new MRNNAutopoieticEngine(referenceData);
            const status = system.getStatus();

            console.log('═══════════════════════════════════════════════════════════════');
            console.log('SYSTEM STATUS');
            console.log('───────────────────────────────────────────────────────────────');
            console.log(`Alive: ${status.alive ? '✅ YES' : '❌ NO'}`);
            console.log(`Age: ${status.age}ms`);
            console.log(`Autopoiesis: ${status.autopoiesis.score}`);
            console.log(`  - Boundary: ${status.autopoiesis.details.hasBoundary ? '✅' : '❌'}`);
            console.log(`  - Components: ${status.autopoiesis.details.hasComponents ? '✅' : '❌'}`);
            console.log(`  - Mechanistic: ${status.autopoiesis.details.isMechanistic ? '✅' : '❌'}`);
            console.log(`  - Internal boundaries: ${status.autopoiesis.details.boundaryInternal ? '✅' : '❌'}`);
            console.log(`  - Self-produced: ${status.autopoiesis.details.componentsProduced ? '✅' : '❌'}`);
            console.log(`  - No external spec: ${status.autopoiesis.details.noExternalSpec ? '✅' : '❌'}`);
            console.log('───────────────────────────────────────────────────────────────');
            console.log(`Body: ${status.body.organs} organs, ${status.body.connections} connections`);
            console.log(`Vitality: ${(status.body.vitality * 100).toFixed(1)}%`);
            console.log(`Components: ${status.body.components}`);
            console.log('───────────────────────────────────────────────────────────────');
            console.log(`Field: ${status.field.size} active states`);
            console.log(`Activation threshold: ${status.field.threshold.toFixed(2)}`);
            console.log(`Decay rate: ${status.field.decay.toFixed(3)}`);
            console.log('───────────────────────────────────────────────────────────────');
            console.log(`Evolution: ${status.evolution.generations} generations`);
            console.log(`Best fitness: ${status.evolution.bestFitness.toFixed(4)}`);
            console.log(`Mutation rate: ${status.evolution.mutationRate.toFixed(3)}`);
            console.log(`Crossover rate: ${status.evolution.crossoverRate.toFixed(3)}`);
            console.log('───────────────────────────────────────────────────────────────');
            console.log(`Scaffold: ${status.scaffold.builds} builds`);
            console.log(`Pages: ${status.scaffold.pages}`);
            console.log(`Output: ${status.scaffold.outputDir}`);
            console.log('═══════════════════════════════════════════════════════════════');
            break;
        }

        case 'serve': {
            const port = parseInt(args[1]) || 3000;
            const outputDir = args.find(a => a.startsWith('--out='))?.split('=')[1] || './dist';

            if (!fs.existsSync(path.join(outputDir, 'index.html'))) {
                console.log(`❌ No built website found in ${outputDir}`);
                console.log('   Run: node MRNN_Unified_Main.js scaffold');
                process.exit(1);
            }

            const server = http.createServer((req, res) => {
                let filePath = path.join(outputDir, req.url === '/' ? 'index.html' : req.url);
                if (!fs.existsSync(filePath)) {
                    filePath = path.join(outputDir, 'index.html');
                }

                const ext = path.extname(filePath);
                const contentType = {
                    '.html': 'text/html',
                    '.js': 'application/javascript',
                    '.css': 'text/css',
                    '.json': 'application/json'
                }[ext] || 'text/plain';

                res.writeHead(200, { 'Content-Type': contentType });
                res.end(fs.readFileSync(filePath));
            });

            server.listen(port, () => {
                console.log(`🌐 Serving MRNN system at http://localhost:${port}`);
                console.log(`   Press Ctrl+C to stop`);
            });

            // Keep process alive
            await new Promise(() => {});
            break;
        }

        case 'interactive':
        default: {
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
                prompt: 'MRNN> '
            });

            system = new MRNNAutopoieticEngine(referenceData);

            console.log('Interactive mode — commands:');
            console.log('  birth [files...]     — Birth system');
            console.log('  ingest <file>        — Ingest file');
            console.log('  scaffold             — Build website');
            console.log('  status               — System status');
            console.log('  autopoiesis          — Run autopoietic loop');
            console.log('  evolve <n>           — Evolve n generations');
            console.log('  quit                 — Exit');
            console.log();

            rl.prompt();

            rl.on('line', async (line) => {
                const parts = line.trim().split(' ');
                const cmd = parts[0];

                switch (cmd) {
                    case 'birth': {
                        const files = parts.slice(1);
                        const result = await system.birth(files);
                        console.log(`Born! Autopoiesis: ${result.autopoiesis.score}`);
                        break;
                    }
                    case 'ingest': {
                        const file = parts[1];
                        if (file) {
                            const result = await system.ingestion.ingest(file);
                            console.log(`${result.action}: ${result.message}`);
                        }
                        break;
                    }
                    case 'scaffold': {
                        const result = await system.scaffold.scaffold();
                        console.log(`Scaffolded: ${result.pages} pages, ${result.components} components`);
                        break;
                    }
                    case 'status': {
                        const s = system.getStatus();
                        console.log(`Alive: ${s.alive}, Organs: ${s.body.organs}, Vitality: ${(s.body.vitality * 100).toFixed(1)}%`);
                        break;
                    }
                    case 'autopoiesis': {
                        const result = await system.autopoieticLoop({ maxIterations: 5 });
                        console.log(`Done: ${result.iterations} iterations, stable=${result.isStable}`);
                        break;
                    }
                    case 'evolve': {
                        const gens = parseInt(parts[1]) || 5;
                        const scenarios = system.generateTestScenarios();
                        const result = await system.evolve(scenarios, gens);
                        console.log(`Evolved: best fitness ${result.fitness.toFixed(4)}`);
                        break;
                    }
                    case 'quit':
                    case 'exit':
                        system.stopHeartbeat();
                        rl.close();
                        return;
                    default:
                        console.log('Unknown command');
                }

                rl.prompt();
            });

            rl.on('close', () => {
                console.log('\nMRNN shutting down...');
                process.exit(0);
            });

            break;
        }
    }
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
