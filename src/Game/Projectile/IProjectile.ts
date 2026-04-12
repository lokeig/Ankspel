import { Vector } from "@math";
import { GameObject } from "@core";
import { ITrail } from "./ITrail";
import { ProjectileEffect } from "@common";

interface IProjectile {
    update(deltaTime: number, collidable: ProjectileTarget[]): void;

    getSegment(): {start: Vector, end: Vector};
    getTrail(): ITrail | null;

    setLocal(): void;

    setToDelete(): void
    shouldBeDeleted(): boolean;

    draw(): void;
}

type ProjectileTarget = {
    body: () => GameObject;
    penetrationResistance: () => number;
    onProjectileHit: (effects: ProjectileEffect[], pos: Vector, local: boolean) => void;
    enabled: () => boolean;
}

type CollisionCallback = (effect: ProjectileEffect[]) => void;

export type { IProjectile, CollisionCallback, ProjectileTarget };