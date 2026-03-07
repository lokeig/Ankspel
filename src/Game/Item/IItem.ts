import { EquipmentSlot, ProjectileEffect, ThrowType } from "@common";
import { DynamicObject } from "@core";
import { Ownership } from "./itemUseType";
import { ItemUseInteractions } from "./itemUseInteractions";
import { Vector } from "@math";


interface IItem {
    update(deltaTime: number): void;
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
    
    onProjectileEffect(effect: ProjectileEffect, pos: Vector, local: boolean): void;
    
    getId(): number;
    
    draw(): void;
}

type ItemConstructor = new (pos: Vector, id: number) => IItem

function isItem(object: any): object is IItem {
    return object && 'throw' in object;
}

export { isItem };
export type { IItem, ItemConstructor };