interface TrailInterface {
    update(deltaTime: number): void;
    shouldBeDeleted(): boolean;
    draw(): void;
    setToDelete(): void;
}

export type { TrailInterface };