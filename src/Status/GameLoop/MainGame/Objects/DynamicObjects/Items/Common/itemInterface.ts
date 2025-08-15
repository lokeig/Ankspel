import { ItemLogic } from "./itemLogic";


export interface ItemInterface {
    update(deltaTime: number): void;
    draw(): void;
    shouldBeDeleted(): boolean;
    interact(): void;
    itemLogic: ItemLogic;
}
