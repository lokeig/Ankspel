class RandomUtility {
    public order(n: number): number[] {
        const arr = Array.from({ length: n }, (_, i) => i);
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(this.getInRange(0, i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    public seed(): number {
        return Math.floor(Math.random() * 0xffffffff);
    }

    public getInRange(min: number, max: number): number {
        return min + (max - min) * Math.random();
    }

    public trueOrFalse(): boolean {
        return Math.random() < 0.5;
    }

    public getInteger(min: number, max: number): number {
        return Math.floor(this.getInRange(min, max + 1));
    }
}

export { RandomUtility };