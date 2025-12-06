interface ITrail {
    update(deltaTime: number): void;
    shouldBeDeleted(): boolean;
    draw(): void;
    setToDelete(): void;
}

export type { ITrail };