
/**
 * MRNN Autopoietic Engine
 * Self-modifying symbolic operating system
 * 
 * The system observes its own operation and modifies:
 * 1. Transition weights (learning from success/failure)
 * 2. Activation thresholds (adapting to environment)
 * 3. Decay rates (memory persistence)
 * 4. Perceptual mappings (how visual states map to MRNN)
 * 5. Goal structures (what the system values)
 * 
 * This creates a living system that evolves its own architecture.
 */

const { MRNNNeuralEngine } = require('./MRNN_Neural_Engine.js');
const { MRNNMCPOrchestrator } = require('./MRNN_MCP_Orchestrator.js');

class MRNNAutopoieticEngine {
    constructor(referenceData, mcpConfig = null) {
        this.orchestrator = new MRNNMCPOrchestrator(referenceData, null);
        this.engine = this.orchestrator.engine;

        // Self-modification parameters
        this.mutationRate = 0.05;
        self.crossoverRate = 0.3;
        self.selectionPressure = 2.0;

        // Evolution tracking
        this.generations = [];
        this.fitnessHistory = [];
        self.structuralChanges = [];

        // Autopoietic state
        this.isSelfModifying = false;
        this.modificationQueue = [];
        this.stabilityThreshold = 0.8;

        // Initialize with random population for genetic evolution
        this.population = this.initializePopulation(100);
    }

    // ============================================================
    // GENETIC EVOLUTION OF STATE TRANSITIONS
    // ============================================================

    initializePopulation(size) {
        const population = [];
        for (let i = 0; i < size; i++) {
            population.push(this.randomGenome());
        }
        return population;
    }

    randomGenome() {
        // A genome is a set of preferred transitions
        const genome = [];
        for (let g = 1; g <= 64; g++) {
            for (let l = 1; l <= 6; l++) {
                genome.push({
                    gate: g,
                    line: l,
                    preferredBase: Math.floor(Math.random() * 5) + 1,
                    preferredTone: Math.floor(Math.random() * 6) + 1,
                    preferredColor: Math.floor(Math.random() * 6) + 1,
                    weight: Math.random()
                });
            }
        }
        return { transitions: genome, fitness: 0 };
    }

    evaluateFitness(genome, testScenarios) {
        let totalFitness = 0;

        for (const scenario of testScenarios) {
            const start = scenario.start;
            const goal = scenario.goal;

            // Apply genome preferences to transition weights
            this.applyGenome(genome);

            // Try to navigate
            const path = this.orchestrator.findPath(start, goal);

            if (path) {
                // Shorter paths = higher fitness
                const pathFitness = 1.0 / (path.length + 1);

                // Resonance quality
                let resonanceSum = 0;
                for (let i = 0; i < path.length - 1; i++) {
                    resonanceSum += this.engine.computeResonance(path[i], path[i+1]);
                }
                const avgResonance = resonanceSum / (path.length - 1);

                totalFitness += pathFitness * 0.6 + avgResonance * 0.4;
            } else {
                totalFitness += 0.1; // Small reward for trying
            }
        }

        return totalFitness / testScenarios.length;
    }

    applyGenome(genome) {
        // Modify transition weights based on genome preferences
        for (const transition of genome.transitions) {
            const state = {
                base: transition.preferredBase,
                tone: transition.preferredTone,
                color: transition.preferredColor,
                gate: transition.gate,
                line: transition.line
            };

            const key = this.engine.stateKey(state);
            const neighbors = this.engine.transitionGraph.get(key) || [];

            for (const neighbor of neighbors) {
                if (neighbor.state.base === transition.preferredBase &&
                    neighbor.state.tone === transition.preferredTone &&
                    neighbor.state.color === transition.preferredColor) {
                    neighbor.weight = Math.min(1.0, neighbor.weight + transition.weight * 0.1);
                }
            }
        }
    }

    // ============================================================
    // GENETIC OPERATORS
    // ============================================================

    selectParent(population) {
        // Tournament selection
        const tournament = [];
        for (let i = 0; i < 3; i++) {
            tournament.push(population[Math.floor(Math.random() * population.length)]);
        }
        tournament.sort((a, b) => b.fitness - a.fitness);
        return tournament[0];
    }

    crossover(parent1, parent2) {
        if (Math.random() > this.crossoverRate) return parent1;

        const child = {
            transitions: [],
            fitness: 0
        };

        for (let i = 0; i < parent1.transitions.length; i++) {
            if (Math.random() < 0.5) {
                child.transitions.push({ ...parent1.transitions[i] });
            } else {
                child.transitions.push({ ...parent2.transitions[i] });
            }
        }

        return child;
    }

    mutate(genome) {
        for (const transition of genome.transitions) {
            if (Math.random() < this.mutationRate) {
                // Mutate one property
                const property = Math.floor(Math.random() * 4);
                switch (property) {
                    case 0: transition.preferredBase = Math.floor(Math.random() * 5) + 1; break;
                    case 1: transition.preferredTone = Math.floor(Math.random() * 6) + 1; break;
                    case 2: transition.preferredColor = Math.floor(Math.random() * 6) + 1; break;
                    case 3: transition.weight = Math.random(); break;
                }
            }
        }
        return genome;
    }

    // ============================================================
    // EVOLUTION CYCLE
    // ============================================================

    async evolve(testScenarios, generations = 10) {
        console.log('Starting autopoietic evolution...');

        for (let gen = 0; gen < generations; gen++) {
            console.log(`\n--- Generation ${gen + 1} ---`);

            // Evaluate fitness
            for (const genome of this.population) {
                genome.fitness = this.evaluateFitness(genome, testScenarios);
            }

            // Sort by fitness
            this.population.sort((a, b) => b.fitness - a.fitness);

            // Track
            const avgFitness = this.population.reduce((sum, g) => sum + g.fitness, 0) / this.population.length;
            const bestFitness = this.population[0].fitness;

            this.fitnessHistory.push({ generation: gen, avg: avgFitness, best: bestFitness });
            console.log(`  Best: ${bestFitness.toFixed(4)} | Avg: ${avgFitness.toFixed(4)}`);

            // Create next generation
            const newPopulation = [this.population[0]]; // Elitism: keep best

            while (newPopulation.length < this.population.length) {
                const parent1 = this.selectParent(this.population);
                const parent2 = this.selectParent(this.population);

                let child = this.crossover(parent1, parent2);
                child = this.mutate(child);
                child.fitness = 0;

                newPopulation.push(child);
            }

            this.population = newPopulation;
            this.generations.push({ generation: gen, population: [...this.population] });
        }

        // Apply best genome
        const best = this.population[0];
        this.applyGenome(best);
        console.log('\n*** Evolution complete ***');
        console.log(`Best genome fitness: ${best.fitness.toFixed(4)}`);

        return best;
    }

    // ============================================================
    // STRUCTURAL SELF-MODIFICATION
    // ============================================================

    selfModify(analysis) {
        this.isSelfModifying = true;

        const changes = [];

        // 1. Adjust activation threshold based on success rate
        const successRate = analysis.successRate || 0.5;
        if (successRate < 0.3) {
            this.engine.activationThreshold = Math.max(0.3, this.engine.activationThreshold - 0.1);
            changes.push({ type: 'threshold', from: this.engine.activationThreshold + 0.1, to: this.engine.activationThreshold });
        } else if (successRate > 0.8) {
            this.engine.activationThreshold = Math.min(0.9, this.engine.activationThreshold + 0.05);
            changes.push({ type: 'threshold', from: this.engine.activationThreshold - 0.05, to: this.engine.activationThreshold });
        }

        // 2. Adjust decay rate based on memory needs
        const avgPathLength = analysis.avgPathLength || 10;
        if (avgPathLength > 20) {
            this.engine.decayRate = Math.max(0.01, this.engine.decayRate - 0.01);
            changes.push({ type: 'decay', from: this.engine.decayRate + 0.01, to: this.engine.decayRate });
        }

        // 3. Modify perceptual mapping if needed
        if (analysis.perceptualMismatch > 0.5) {
            this.orchestrator.learningRate = Math.min(0.5, this.orchestrator.learningRate + 0.05);
            changes.push({ type: 'learning_rate', from: this.orchestrator.learningRate - 0.05, to: this.orchestrator.learningRate });
        }

        // 4. Add new transitions if exploration is low
        if (analysis.explorationRate < 0.2) {
            this.addNovelTransitions(10);
            changes.push({ type: 'novel_transitions', count: 10 });
        }

        this.structuralChanges.push({
            timestamp: Date.now(),
            changes,
            analysis
        });

        this.isSelfModifying = false;
        return changes;
    }

    addNovelTransitions(count) {
        // Add random transitions to increase connectivity
        const states = this.engine.generateAllStates();

        for (let i = 0; i < count; i++) {
            const s1 = states[Math.floor(Math.random() * states.length)];
            const s2 = states[Math.floor(Math.random() * states.length)];

            const key1 = this.engine.stateKey(s1);
            const neighbors = this.engine.transitionGraph.get(key1) || [];

            // Add if not already connected
            if (!neighbors.some(n => this.engine.stateKey(n.state) === this.engine.stateKey(s2))) {
                neighbors.push({
                    state: s2,
                    weight: 0.1,
                    type: 'novel'
                });
                this.engine.transitionGraph.set(key1, neighbors);
            }
        }
    }

    // ============================================================
    // META-LEARNING: Learn how to learn
    // ============================================================

    metaLearn() {
        // Analyze which modifications worked best
        const successfulChanges = this.structuralChanges.filter(
            change => change.analysis.successRate > 0.6
        );

        const failedChanges = this.structuralChanges.filter(
            change => change.analysis.successRate < 0.3
        );

        // Extract patterns
        const successPatterns = this.extractPatterns(successfulChanges);
        const failurePatterns = this.extractPatterns(failedChanges);

        // Update modification strategy
        this.mutationRate = this.adaptParameter(this.mutationRate, successPatterns, failurePatterns, 'mutation');
        this.crossoverRate = this.adaptParameter(this.crossoverRate, successPatterns, failurePatterns, 'crossover');

        return {
            successPatterns,
            failurePatterns,
            newMutationRate: this.mutationRate,
            newCrossoverRate: this.crossoverRate
        };
    }

    extractPatterns(changes) {
        const patterns = {};
        for (const change of changes) {
            for (const c of change.changes) {
                const type = c.type;
                if (!patterns[type]) patterns[type] = [];
                patterns[type].push(c);
            }
        }
        return patterns;
    }

    adaptParameter(current, successPatterns, failurePatterns, paramName) {
        const successCount = (successPatterns[paramName] || []).length;
        const failureCount = (failurePatterns[paramName] || []).length;

        if (successCount > failureCount) {
            return Math.min(0.9, current * 1.1);
        } else if (failureCount > successCount) {
            return Math.max(0.01, current * 0.9);
        }
        return current;
    }

    // ============================================================
    // AUTOPOIETIC LOOP
    // ============================================================

    async autopoieticLoop(scenarios) {
        console.log('\n=== AUTOPOIETIC LOOP STARTING ===');

        let iteration = 0;
        let stable = false;

        while (!stable && iteration < 50) {
            iteration++;
            console.log(`\n--- Autopoietic Iteration ${iteration} ---`);

            // 1. Run with current structure
            const results = [];
            for (const scenario of scenarios) {
                const result = await this.orchestrator.run(scenario.goal);
                results.push(result);
            }

            // 2. Analyze performance
            const analysis = this.analyzePerformance(results);
            console.log('Performance:', analysis);

            // 3. Self-modify
            const changes = this.selfModify(analysis);
            console.log('Structural changes:', changes.length);

            // 4. Meta-learn
            const meta = this.metaLearn();
            console.log('Meta-learning:', meta);

            // 5. Evolve
            await this.evolve(scenarios, 3);

            // Check stability
            stable = analysis.successRate > this.stabilityThreshold && 
                     analysis.explorationRate > 0.3;

            if (stable) {
                console.log('\n*** SYSTEM STABILIZED ***');
            }
        }

        return {
            iterations: iteration,
            finalStructure: this.getStructureSnapshot(),
            fitnessHistory: this.fitnessHistory,
            structuralChanges: this.structuralChanges
        };
    }

    analyzePerformance(results) {
        const successCount = results.filter(r => r.success).length;
        const totalSteps = results.reduce((sum, r) => sum + r.steps, 0);
        const avgSteps = totalSteps / results.length;

        // Calculate exploration rate from state history
        const uniqueStates = new Set();
        for (const result of results) {
            for (const action of result.log) {
                if (action.from) uniqueStates.add(action.from);
                if (action.to) uniqueStates.add(action.to);
            }
        }
        const explorationRate = uniqueStates.size / 69120;

        return {
            successRate: successCount / results.length,
            avgPathLength: avgSteps,
            explorationRate,
            perceptualMismatch: 0.3, // Would be calculated from actual perception
            totalUniqueStates: uniqueStates.size
        };
    }

    getStructureSnapshot() {
        return {
            activationThreshold: this.engine.activationThreshold,
            decayRate: this.engine.decayRate,
            learningRate: this.orchestrator.learningRate,
            mutationRate: this.mutationRate,
            crossoverRate: this.crossoverRate,
            transitionCount: this.engine.transitionGraph.size,
            fieldSize: this.engine.resonanceField.size,
            populationSize: this.population.length,
            generations: this.generations.length
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MRNNAutopoieticEngine };
}
