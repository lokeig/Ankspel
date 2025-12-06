interface IParticle {
    update(deltaTime: number): void;
    draw(): void;
    shouldBeDeleted(): boolean;
}

export type { IParticle };