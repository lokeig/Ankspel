class IDManager {
    private static baseOffset: number = 0;
    private startOffset: number = 50;

    private currentIndex: number = this.startOffset;
    private idToObject: Map<number, Object> = new Map();
    private objectToID: Map<Object, number> = new Map();

    private permanents: [Object, number][] = [];

    public static setBaseOffset(offset: number): void {
        this.baseOffset = offset;
    }

    public static getBaseOffset(): number {
        return this.baseOffset;
    }

    public getNextID(): number {
        return IDManager.baseOffset + this.currentIndex;
    }

    public reset(): void {
        this.currentIndex = this.startOffset;
        this.idToObject.clear();
        this.objectToID.clear();

        this.permanents.forEach(([object, id]) => this.setID(object, id));
    }

    public add(object: Object): number {
        const index = this.currentIndex++ + IDManager.baseOffset;
        this.idToObject.set(index, object);
        this.objectToID.set(object, index);
        return index;
    }

    public removeObject(object: Object): number | undefined {
        const id = this.objectToID.get(object);
        if (id === undefined) {
            return id;
        }
        this.objectToID.delete(object);
        this.idToObject.delete(id);
        return id;
    }

    public setID(object: Object, id: number): void {
        this.objectToID.set(object, id);
        this.idToObject.set(id, object);
    }

    public getObject(id: number): Object | undefined {
        return this.idToObject.get(id);
    }

    public getID(object: Object): number | undefined {
        return this.objectToID.get(object);
    }

    public setPermanentID(object: Object, id: number): void {
        this.objectToID.set(object, id);
        this.idToObject.set(id, object);

        this.permanents.push([object, id]);
    }

    public getPermanent(): Object[] {
        return this.permanents.map(tuple => tuple[0]);
    }
}

export { IDManager };