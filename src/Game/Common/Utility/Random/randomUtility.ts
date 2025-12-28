class RandomUtility {
    public getRandomArray(n: number): number[] {
        const arr = Array.from({ length: n }, (_, i) => i);
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(this.getRandomNumber(0, i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    public getRandomSeed(): number {
        return Math.floor(Math.random() * 0xffffffff);
    }

    public getRandomNumber(min: number, max: number) {
        return min + (max - min) * Math.random();
    }
}

export { RandomUtility };