import { Ball, Paddle } from '@/types/game';

interface GameState {
    ballX: number;
    ballY: number;
    ballDX: number;
    ballDY: number;
    aiPaddleY: number;
    userPaddleY: number;
    score: number;
    aiScore: number;
}

interface Action {
    type: 'UP' | 'DOWN' | 'STAY';
}

export class AIAgent {
    private readonly learningRate = 0.1;
    private readonly discountFactor = 0.95;
    private explorationRate = 0.3;
    private readonly minExplorationRate = 0.01;
    private readonly explorationDecay = 0.995;
    private qTable: Map<string, { [key: string]: number }> = new Map();
    private totalGames = 0;

    constructor() {
        // Initialize Q-table with random values
        this.initializeQTable();
    }

    private initializeQTable(): void {
        // Create a simple state space with discretized values
        const states = this.generateStates();
        const actions: Action['type'][] = ['UP', 'DOWN', 'STAY'];

        states.forEach(state => {
            const stateKey = this.getStateKey(state);
            this.qTable.set(stateKey, {});
            actions.forEach(action => {
                this.qTable.get(stateKey)![action] = Math.random() * 0.1; // Small random initial values
            });
        });
    }

    private generateStates(): GameState[] {
        const states: GameState[] = [];
        // Generate a simplified state space
        // We'll discretize the ball position and paddle positions
        const ballPositions = [0, 0.25, 0.5, 0.75, 1]; // Normalized positions
        const paddlePositions = [0, 0.25, 0.5, 0.75, 1];
        const ballVelocities = [-1, 0, 1]; // Simplified velocity states

        ballPositions.forEach(ballX => {
            ballPositions.forEach(ballY => {
                ballVelocities.forEach(ballDX => {
                    ballVelocities.forEach(ballDY => {
                        paddlePositions.forEach(aiPaddleY => {
                            paddlePositions.forEach(userPaddleY => {
                                states.push({
                                    ballX,
                                    ballY,
                                    ballDX,
                                    ballDY,
                                    aiPaddleY,
                                    userPaddleY,
                                    score: 0,
                                    aiScore: 0
                                });
                            });
                        });
                    });
                });
            });
        });

        return states;
    }

    private getStateKey(state: GameState): string {
        // Discretize the state for Q-table lookup
        const discretizedState = {
            ballX: Math.floor(state.ballX * 4) / 4,
            ballY: Math.floor(state.ballY * 4) / 4,
            ballDX: Math.sign(state.ballDX),
            ballDY: Math.sign(state.ballDY),
            aiPaddleY: Math.floor(state.aiPaddleY * 4) / 4,
            userPaddleY: Math.floor(state.userPaddleY * 4) / 4
        };
        return JSON.stringify(discretizedState);
    }

    public normalizeState(ball: Ball, aiPaddle: Paddle, userPaddle: Paddle): GameState {
        return {
            ballX: ball.x / 800, // Assuming canvas width is 800
            ballY: ball.y / 600, // Assuming canvas height is 600
            ballDX: ball.dx / 10, // Normalize velocity
            ballDY: ball.dy / 10,
            aiPaddleY: aiPaddle.y / 600,
            userPaddleY: userPaddle.y / 600,
            score: 0, // These will be updated by the game
            aiScore: 0
        };
    }

    public getAction(ball: Ball, aiPaddle: Paddle, userPaddle: Paddle): Action {
        const state = this.normalizeState(ball, aiPaddle, userPaddle);
        const stateKey = this.getStateKey(state);

        // Exploration vs Exploitation
        if (Math.random() < this.explorationRate) {
            // Random action
            const actions: Action['type'][] = ['UP', 'DOWN', 'STAY'];
            return { type: actions[Math.floor(Math.random() * actions.length)] };
        }

        // Get best action from Q-table
        const qValues = this.qTable.get(stateKey) || {};
        const bestAction = Object.entries(qValues).reduce((a, b) => a[1] > b[1] ? a : b)[0] as Action['type'];
        return { type: bestAction };
    }

    public updateQValue(
        state: GameState,
        action: Action,
        reward: number,
        nextState: GameState
    ): void {
        const stateKey = this.getStateKey(state);
        const nextStateKey = this.getStateKey(nextState);

        // Get current Q-value
        const currentQ = this.qTable.get(stateKey)?.[action.type] || 0;

        // Get maximum Q-value for next state
        const nextQValues = this.qTable.get(nextStateKey) || {};
        const maxNextQ = Math.max(...Object.values(nextQValues));

        // Update Q-value using Q-learning formula
        const newQ = currentQ + this.learningRate * (reward + this.discountFactor * maxNextQ - currentQ);

        // Update Q-table
        if (!this.qTable.has(stateKey)) {
            this.qTable.set(stateKey, {});
        }
        this.qTable.get(stateKey)![action.type] = newQ;

        // Decay exploration rate
        this.explorationRate = Math.max(
            this.minExplorationRate,
            this.explorationRate * this.explorationDecay
        );
    }

    public onGameEnd(aiWon: boolean): void {
        this.totalGames++;
        // You could implement additional learning from game results here
    }

    public getStats(): { totalGames: number; explorationRate: number } {
        return {
            totalGames: this.totalGames,
            explorationRate: this.explorationRate
        };
    }
} 