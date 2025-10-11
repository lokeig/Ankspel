import { lerpStandard } from "..";

class Lerp {
    private t = 0;
    private start!: number;
    private target!: number;
    private speed: number;
    private active = false;
    private interpolate: (a: number, b: number, t: number) => number;

    constructor(speed: number, interpolate: (a: number, b: number, t: number) => number = lerpStandard) {
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

export { Lerp };