import { ItemLogic } from "./itemLogic";

interface ItemInterface {
    update(deltaTime: number): void;
    draw(): void;
    shouldBeDeleted(): boolean;
    interact(): void;
    itemLogic: ItemLogic;
}

export type { ItemInterface };