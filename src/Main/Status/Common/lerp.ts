export function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
} 

export function lerpAngle(a: number, b: number, t: number) {
    const difference = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
    return a + difference * t;
}

export function triangleLerp(a: number, b: number, t: number): number {
    return t < 0.5
        ? a + (b - a) * (t * 2)
        : b + (a - b) * ((t - 0.5) * 2);
}

export class LerpValue {
    private t = 0;
    private start!: number;
    private target!: number;
    private speed: number;
    private active = false;
    private interpolate: (a: number, b: number, t: number) => number;

    constructor(speed: number, interpolate: (a: number, b: number, t: number) => number = lerp) {
        this.speed = speed;
        this.interpolate = interpolate;
    }

    public startLerp(from: number, to: number): void {
        this.start = from;
        this.target = to;
        this.t = 0;
        this.active = true;
    }

    public update(deltaTime: number): number {
        if (!this.active) {
            return this.target;
        }
        this.t += deltaTime * this.speed;
        if (this.t >= 1) {
            this.t = 1;
            this.active = false;
        }

        return this.interpolate(this.start, this.target, this.t);
    }

    public isActive(): boolean {
        return this.active;
    }

    public cancel(): void {
        this.active = false;
        this.t = 0;
    }

    public setSpeed(speed: number): void {
        this.speed = speed;
    }
}