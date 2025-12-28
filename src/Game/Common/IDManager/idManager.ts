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

    public removeObject(object: T): number | undefined {
        const id = this.objectToID.get(object);
        if (!id) {
            return undefined;
        }
        this.objectToID.delete(object);
        this.idToObject.delete(id);
        return id;
    }

    public removeID(id: number): T | undefined {
        const object = this.idToObject.get(id);
        if (!object) {
            return undefined;
        }
        this.objectToID.delete(object);
        this.idToObject.delete(id);
        return object;
    }

    public setID(object: T, id: number): void {
        this.objectToID.set(object, id);
        this.idToObject.set(id, object);
    }

    public getObject(id: number): T | undefined {
        return this.idToObject.get(id);
    }

    public getID(object: T): number | undefined {
        return this.objectToID.get(object);
    }
}

export { IDManager };


