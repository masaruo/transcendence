export interface Ball {
    x: number;
    y: number;
    dx: number;
    dy: number;
    radius: number;
}

export interface Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
    dy: number;
}

export interface Score {
    user: number;
    ai: number;
} 