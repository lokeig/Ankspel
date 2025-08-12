export class Countdown {
    timeCounted: number = 0;
    cooldownTime: number;
    constructor(cooldownTime: number) {
        this.cooldownTime = cooldownTime;
    }
    update(deltaTime: number) {
        this.timeCounted += deltaTime;
    }
    isDone(): boolean {
        return this.timeCounted >= this.cooldownTime;
    }
    reset() {
        this.timeCounted = 0;
    }
    setToReady() {
        this.timeCounted = this.cooldownTime;
    }

    getPercentageReady(): number {
        return this.timeCounted / this.cooldownTime;
    }
}