class Countdown {
    private timeCounted: number = 0;
    private cooldownTime: number;

    constructor(cooldownTime: number) {
        this.cooldownTime = cooldownTime;
    }
    
    public update(deltaTime: number) {
        this.timeCounted += deltaTime;
    }
    
    public isDone(): boolean {
        return this.timeCounted >= this.cooldownTime;
    }
    
    public reset() {
        this.timeCounted = 0;
    }
    
    public setToReady() {
        this.timeCounted = this.cooldownTime;
    }

    public getPercentageReady(): number {
        return this.timeCounted / this.cooldownTime;
    }
}

export { Countdown };