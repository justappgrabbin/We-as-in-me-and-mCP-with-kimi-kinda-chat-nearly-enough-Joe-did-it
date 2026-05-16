
/**
 * MRNN Complete System — Main Entry Point
 * 
 * Usage:
 *   node MRNN_Main.js [command] [args]
 * 
 * Commands:
 *   query <address>              — Query any B.T.C.G.L address
 *   run <goal_gate> <goal_line>  — Run orchestrator toward goal
 *   evolve <generations>         — Run autopoietic evolution
 *   perceive                     — Perceive current mobile screen
 *   status                       — Show system status
 *   interactive                  — Interactive mode
 * 
 * Examples:
 *   node MRNN_Main.js query B3.T4.C2.G57.L3
 *   node MRNN_Main.js run 57 3
 *   node MRNN_Main.js evolve 10
 *   node MRNN_Main.js perceive
 */

const fs = require('fs');
const path = require('path');

// Load reference data
const referenceData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'MRNN_Reference_Data.json'), 'utf8')
);

// Load engines
const { MRNNNeuralEngine } = require('./MRNN_Neural_Engine.js');
const { MRNNMCPOrchestrator } = require('./MRNN_MCP_Orchestrator.js');
const { MRNNAutopoieticEngine } = require('./MRNN_Autopoietic_Engine.js');

async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'interactive';

    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║     MRNN Symbolic Operating System v1.0                      ║');
    console.log('║     5 Layers | 69,120 States | MCP-Enabled | Self-Modifying  ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log();

    switch (command) {
        case 'query': {
            const address = args[1];
            if (!address) {
                console.log('Usage: node MRNN_Main.js query B1.T2.C3.G4.L5');
                process.exit(1);
            }

            const engine = new MRNNNeuralEngine(referenceData);
            const result = engine.query(address);

            if (result) {
                console.log('═══════════════════════════════════════════════════════════════');
                console.log(`Address: ${result.address}`);
                console.log(`Frequency: ${result.frequency.toFixed(2)} Hz`);
                console.log(`Resonance: ${result.resonance}`);
                console.log(`Phase: ${result.phase.toFixed(4)} rad`);
                console.log(`Neighbors: ${result.neighbors}`);
                console.log('───────────────────────────────────────────────────────────────');
                console.log('Layers:');
                console.log(`  Base:  ${result.layers.base.name} (${result.layers.base.wuxing})`);
                console.log(`  Tone:  ${result.layers.tone.name} (${result.layers.tone.sense})`);
                console.log(`  Color: ${result.layers.color.name} (${result.layers.color.motivation})`);
                console.log(`  Gate:  ${result.layers.gate.name} — ${result.layers.gate.theme}`);
                console.log(`  Line:  ${result.layers.line.name} — ${result.layers.line.role}`);
                console.log('───────────────────────────────────────────────────────────────');
                console.log('Meaning:');
                console.log(`  ${result.meaning}`);
                console.log('═══════════════════════════════════════════════════════════════');
            } else {
                console.log('Invalid address format. Use: B[1-5].T[1-6].C[1-6].G[1-64].L[1-6]');
            }
            break;
        }

        case 'run': {
            const goalGate = parseInt(args[1]) || 57;
            const goalLine = parseInt(args[2]) || 3;

            console.log(`Starting orchestrator toward Gate ${goalGate}, Line ${goalLine}...`);
            console.log('(Running in simulation mode — connect MCP for real device)');
            console.log();

            const orchestrator = new MRNNMCPOrchestrator(referenceData);

            // Set goal
            const goal = {
                base: 3, tone: 4, color: 2,
                gate: goalGate, line: goalLine
            };

            const result = await orchestrator.run(goal);

            console.log();
            console.log('═══════════════════════════════════════════════════════════════');
            console.log('RUN COMPLETE');
            console.log(`Success: ${result.success}`);
            console.log(`Steps: ${result.steps}`);
            console.log(`Actions logged: ${result.log.length}`);
            console.log('═══════════════════════════════════════════════════════════════');
            break;
        }

        case 'evolve': {
            const generations = parseInt(args[1]) || 10;

            console.log(`Starting autopoietic evolution (${generations} generations)...`);
            console.log();

            const auto = new MRNNAutopoieticEngine(referenceData);

            // Create test scenarios
            const scenarios = [
                { start: { base: 1, tone: 1, color: 1, gate: 1, line: 1 },
                  goal: { base: 5, tone: 6, color: 6, gate: 64, line: 6 } },
                { start: { base: 3, tone: 3, color: 3, gate: 30, line: 3 },
                  goal: { base: 3, tone: 4, color: 2, gate: 57, line: 3 } },
                { start: { base: 2, tone: 2, color: 2, gate: 15, line: 2 },
                  goal: { base: 4, tone: 5, color: 4, gate: 40, line: 4 } }
            ];

            const result = await auto.autopoieticLoop(scenarios);

            console.log();
            console.log('═══════════════════════════════════════════════════════════════');
            console.log('EVOLUTION COMPLETE');
            console.log(`Iterations: ${result.iterations}`);
            console.log(`Final structure:`, result.finalStructure);
            console.log(`Structural changes: ${result.structuralChanges.length}`);
            console.log('═══════════════════════════════════════════════════════════════');
            break;
        }

        case 'perceive': {
            console.log('Perceiving mobile screen...');
            console.log('(Requires MCP connection — run with mobile device attached)');

            const orchestrator = new MRNNMCPOrchestrator(referenceData);
            const perceived = await orchestrator.perceive();

            console.log();
            console.log('═══════════════════════════════════════════════════════════════');
            console.log('PERCEPTION');
            console.log(`State: B${perceived.base}.T${perceived.tone}.C${perceived.color}.G${perceived.gate}.L${perceived.line}`);
            console.log(`Mode: ${perceived.simulated ? 'SIMULATED' : 'LIVE'}`);
            console.log('═══════════════════════════════════════════════════════════════');
            break;
        }

        case 'status': {
            const engine = new MRNNNeuralEngine(referenceData);
            const status = {
                states: 69120,
                transitions: engine.transitionGraph.size,
                layers: 5,
                gates: 64,
                lines: 6,
                bases: 5,
                tones: 6,
                colors: 6,
                centers: 9,
                channels: referenceData.channels.length
            };

            console.log('═══════════════════════════════════════════════════════════════');
            console.log('SYSTEM STATUS');
            console.log('───────────────────────────────────────────────────────────────');
            console.log(`Total phase states:    ${status.states.toLocaleString()}`);
            console.log(`Transition graph size: ${status.transitions.toLocaleString()}`);
            console.log(`Layers:                ${status.layers}`);
            console.log(`Gates:                 ${status.gates}`);
            console.log(`Lines per gate:        ${status.lines}`);
            console.log(`Bases:                 ${status.bases}`);
            console.log(`Tones:                 ${status.tones}`);
            console.log(`Colors:                ${status.colors}`);
            console.log(`Centers:               ${status.centers}`);
            console.log(`Channels:              ${status.channels}`);
            console.log('───────────────────────────────────────────────────────────────');
            console.log('Components:');
            console.log('  ✓ Neural Engine (state transitions + resonance)');
            console.log('  ✓ MCP Orchestrator (mobile device automation)');
            console.log('  ✓ Autopoietic Engine (self-modification + evolution)');
            console.log('═══════════════════════════════════════════════════════════════');
            break;
        }

        case 'interactive':
        default: {
            console.log('Interactive mode — type commands:');
            console.log('  query <address>  — Query a state');
            console.log('  run <g> <l>      — Run toward goal');
            console.log('  status           — System status');
            console.log('  quit             — Exit');
            console.log();

            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
                prompt: 'MRNN> '
            });

            const engine = new MRNNNeuralEngine(referenceData);

            rl.prompt();

            rl.on('line', (line) => {
                const parts = line.trim().split(' ');
                const cmd = parts[0];

                switch (cmd) {
                    case 'query': {
                        const addr = parts[1];
                        const result = engine.query(addr);
                        if (result) {
                            console.log(`${result.address}: ${result.meaning}`);
                            console.log(`  Frequency: ${result.frequency.toFixed(2)} Hz | Resonance: ${result.resonance}`);
                        } else {
                            console.log('Invalid address');
                        }
                        break;
                    }
                    case 'status':
                        console.log(`Field size: ${engine.resonanceField.size} | History: ${engine.stateHistory.length}`);
                        break;
                    case 'quit':
                    case 'exit':
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
