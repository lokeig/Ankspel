import { GameObject } from "@core";
import { ITrail } from "./ITrail";
import { ProjectileEffect, Vector } from "@common";

interface IProjectile {
    update(deltaTime: number): void;
    onPlayerHit(seed: number): ProjectileEffect, 

    willGoThrough(block: GameObject, deltaTime: number): { collision: boolean, pos: Vector };
    getPos(): Vector;
    setPos(pos: Vector): void;

    getTrail(): ITrail;

    isLocal(): boolean;
    setLocal(): void;
    setToDelete(): void
    shouldBeDeleted(): boolean;

    draw(): void;
}

type ProjectileConstructor = new (pos: Vector, angle: number) => IProjectile;

export type { IProjectile, ProjectileConstructor };