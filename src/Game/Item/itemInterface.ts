import { Vector } from "@common";
import { ItemLogic } from "./itemLogic";

interface ItemInterface {
    update(deltaTime: number): void;
    draw(): void;
    shouldBeDeleted(): boolean;
    common: ItemLogic;
}

type ItemConstructor = new (pos: Vector) => ItemInterface

export type { ItemInterface, ItemConstructor };