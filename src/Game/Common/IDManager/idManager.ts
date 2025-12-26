class IDManager<T> {
    private static baseOffset: number = 0;
    private currentIndex: number = 0;
    private idToObject: Map<number, T> = new Map();
    private objectToID: Map<T, number> = new Map();

    public static setBaseOffset(offset: number): void {
        this.baseOffset = offset;
    }

    public reset(): void {
        this.currentIndex = 0;
        this.idToObject.clear();
        this.objectToID.clear();
    }

    public add(object: T): number {
        const index = this.currentIndex++ + IDManager.baseOffset;
        this.idToObject.set(index, object);
        this.objectToID.set(object, index);
        return index;
    }

    public removeObject(object: T): void {
        const id = this.objectToID.get(object);
        if (!id) {
            return;
        }
        this.objectToID.delete(object);
        this.idToObject.delete(id);
    }

    public setID(object: T, id: number): void {
        this.objectToID.set(object, id);
        this.idToObject.set(id, object);
    }

    public get(id: number): T | undefined {
        return this.idToObject.get(id);
    }

    public object(object: T): number | undefined {
        return this.objectToID.get(object);
    }
}

export { IDManager };


