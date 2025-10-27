import { Vector } from "@common";
import { StaticObject } from "@core";

interface TileInterface {
    staticObject: StaticObject;
    update(): void;
    draw(): void;
}

type TileConstructor = new (pos: Vector, size: number) => TileInterface;

export type { TileInterface, TileConstructor };