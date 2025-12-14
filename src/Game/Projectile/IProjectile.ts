import { DynamicObject } from "@core";
import { ITrail } from "./ITrail";
import { Vector } from "@common";

interface IProjectile {
    body: DynamicObject;
    update(deltaTime: number): void;
    draw(): void;
    getTrail(): ITrail;
    shouldBeDeleted(): boolean;
}

type ProjectileConstructor = new (pos: Vector, angle: number) => IProjectile;

export type { IProjectile, ProjectileConstructor };