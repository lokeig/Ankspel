class DeltaTime {
    private static time: number = 0;

    public static get(): number {
        return this.time;
    }

    public static set(time: number) {
        this.time = time;
    }
}

export { DeltaTime };