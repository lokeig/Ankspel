class IDManager<T> {
    private currentIndex = 0;
    private idToObject: Map<number, T> = new Map();
    private objectToID: Map<T, number> = new Map();

    public reset(): void {
        this.currentIndex = 0;
    }

    public set(object: T): number {
        this.idToObject.set(this.currentIndex++, object);
        this.objectToID.set(object, this.currentIndex);
        return this.currentIndex;
    }

    public get(id: number): T {
        return this.idToObject.get(id)!;
    }

    public object(object: T): number {
        return this.objectToID.get(object)!;
    }
}

export { IDManager };


