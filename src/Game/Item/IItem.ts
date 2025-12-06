import { Vector } from "@common";
import { ItemLogic } from "./itemLogic";

interface IItem {
    update(deltaTime: number): void;
    draw(): void;
    shouldBeDeleted(): boolean;
    common: ItemLogic;
}

type ItemConstructor = new (pos: Vector) => IItem

export type { IItem, ItemConstructor };