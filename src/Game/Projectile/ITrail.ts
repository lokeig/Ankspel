import { Vector } from "@common";

interface ITrail {
    update(deltaTime: number): void;
    setTarget(pos: Vector): void;
    shouldBeDeleted(): boolean;
    draw(): void;
    setToDelete(): void;
}

export type { ITrail };