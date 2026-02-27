import { EquipmentSlot, ThrowType } from "@common";
import { DynamicObject } from "@core";
import { Ownership } from "./itemUseType";
import { ItemUseInteractions } from "./itemUseInteractions";
import { Vector } from "@math";


interface IItem {
    update(deltaTime: number): void;
    draw(): void;
    getBody(): DynamicObject;
    interactions(): ItemUseInteractions;

    setOwnership(value: Ownership): void;
    getOwnership(): Ownership;

    onEquip?(slot: EquipmentSlot): void;
    onUnequip?(): void;

    throw(throwType: ThrowType): void;
    enabled(): boolean;

    shouldBeDeleted(): boolean;
    setToDelete(): void;

    getAngle(): number;
    setAngle(to: number): void;

    getHoldOffset(): Vector;
    getHandOffset(): Vector;
}

type ItemConstructor = new (pos: Vector) => IItem

function isItem(object: any): object is IItem {
    return object && 'throw' in object;
}

export { isItem };
export type { IItem, ItemConstructor };