export class Cooldown {
    timeCounted: number = 0;
    cooldownTime: number;
    constructor(cooldownTime: number) {
        this.cooldownTime = cooldownTime;
    }
    update(deltaTime: number) {
        this.timeCounted += deltaTime;
    }
    isReady(): boolean {
        return this.timeCounted >= this.cooldownTime;
    }
    reset() {
        this.timeCounted = 0;
    }
    setToReady() {
        this.timeCounted = this.cooldownTime;
    }
}