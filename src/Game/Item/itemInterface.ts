import { ItemLogic } from "./itemLogic";

interface ItemInterface {
    update(deltaTime: number): void;
    draw(): void;
    shouldBeDeleted(): boolean;
    itemLogic: ItemLogic;
}

export type { ItemInterface };