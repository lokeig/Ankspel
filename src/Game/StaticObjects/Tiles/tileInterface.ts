import { Vector } from "@common";
import { StaticObject } from "@core";

interface TileInterface {
    body: StaticObject;
    update(): void;
    draw(): void;
}

type TileConstructor = new (pos: Vector, size: number) => TileInterface;

export type { TileInterface, TileConstructor };