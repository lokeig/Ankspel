import { DynamicObject } from "@core";
import { ITrail } from "./ITrail";

interface IProjectile {
    body: DynamicObject;
    update(deltaTime: number): void;
    draw(): void;
    getTrail(): ITrail;
    shouldBeDeleted(): boolean;
}

export type { IProjectile };