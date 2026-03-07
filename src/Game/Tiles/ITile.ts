import { Vector } from "@math";
import { StaticObject } from "@core";

interface ITile {
    body: StaticObject;
    update(): void;
    enabled(): boolean;
    draw(): void;
}

type TileConstructor = new (pos: Vector, size: number) => ITile;

export type { ITile, TileConstructor };