import { ThrowType } from "@common";
import { DynamicObject } from "@core";
import { Ownership } from "./ItemPlayerUse/itemUseType";
import { ItemPlayerInteraction } from "./ItemPlayerUse/itemUseInteractions";
import { Vector } from "@math";
import { ItemIgnore } from "./Helpers/itemIgnore";
import { ItemPlayerCollision } from "./Helpers/itemPlayerCollision";
import { ItemProjectileCollision } from "./Helpers/itemProjectileCollision";
import { ItemInfo } from "./itemInfo";

interface IItem {
    update(deltaTime: number): void;

    body: DynamicObject;
    info: ItemInfo;

    playerInteractions: ItemPlayerInteraction;
    playerCollision: ItemPlayerCollision;
    ignoring: ItemIgnore;

    getAngle(): number;
    setAngle(to: number): void;

    projectileCollision: ItemProjectileCollision | null;
    ownership: Ownership;

    throw(throwType: ThrowType): void;
    enabled(): boolean;

    shouldBeDeleted(): boolean;
    setToDelete(): void;
    onDestroy?(): void;

    draw(): void;
    drawTopLayer?(): void;
}


type ItemConstructor = new (pos: Vector, id: number) => IItem

function isItem(object: any): object is IItem {
    return object && 'throw' in object;
}

export { isItem };
export type { IItem, ItemConstructor };