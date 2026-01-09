import { DynamicObject } from "@core";
import { ITrail } from "./ITrail";
import { Vector } from "@common";
import { ProjectileEffect } from "./projectileEffect";

interface IProjectile {
    update(deltaTime: number): void;
    getBody(): DynamicObject;
    getTrail(): ITrail;
    onCollision(): void;
    isLocal(): boolean;
    setLocal(): void;
    onPlayerHit(): ProjectileEffect, 
    setToDelete(): void
    shouldBeDeleted(): boolean;
    draw(): void;
}

type ProjectileConstructor = new (pos: Vector, angle: number) => IProjectile;

export type { IProjectile, ProjectileConstructor };