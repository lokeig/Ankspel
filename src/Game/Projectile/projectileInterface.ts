import { DynamicObject } from "@core";
import { TrailInterface } from "./trailInterface";

interface ProjectileInterface {
    body: DynamicObject;
    update(deltaTime: number): void;
    draw(): void;
    getTrail(): TrailInterface;
    shouldBeDeleted(): boolean;
}

export type { ProjectileInterface };