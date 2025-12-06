import { Vector } from "@common";
import { StaticObject } from "@core";

interface ITile {
    body: StaticObject;
    update(): void;
    draw(): void;
}

type TileConstructor = new (pos: Vector, size: number) => ITile;

export type { ITile, TileConstructor };