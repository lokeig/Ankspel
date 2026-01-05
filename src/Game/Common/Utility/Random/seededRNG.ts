class SeededRNG {
    private state: number;

    constructor(seed: number) {
        this.state = seed >>> 0;
    }

    public next(): number {
        this.state = (1664525 * this.state + 1013904223) >>> 0;
        return this.state / 0x100000000;
    }

    public getInRange(min: number, max: number) {
        return min + (max - min) * this.next();
    }
}

export { SeededRNG };