class SeededRNG {
    private state: number;

    constructor(seed: number) {
        this.state = seed >>> 0;
    }

    public next(): number {
        this.state = (1664525 * this.state + 1013904223) >>> 0;
        return this.state / 0x100000000;
    }

    public getNewSeed(): number {
        return Math.floor(this.next() * 0xffffffff);
    }

    public getInRange(min: number, max: number) {
        return min + (max - min) * this.next();
    }

    public getRandomInteger(min: number, max: number): number {
        return Math.floor(this.getInRange(min, max + 1));
    }

    public order(n: number): number[] {
        const arr = Array.from({ length: n }, (_, i) => i);
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(this.getInRange(0, i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
}

export { SeededRNG };