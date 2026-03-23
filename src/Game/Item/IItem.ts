import { ThrowType } from "@common";
import { DynamicObject } from "@core";
import { Ownership } from "./itemUseType";
import { ItemPlayerInteraction } from "./itemUseInteractions";
import { Vector } from "@math";


interface IItem {
    update(deltaTime: number): void;
    getBody(): DynamicObject;
    playerInteractions(): ItemPlayerInteraction;
    
    setOwnership(value: Ownership): void;
    getOwnership(): Ownership;
    
    throw(throwType: ThrowType): void;
    enabled(): boolean;
    
    shouldBeDeleted(): boolean;
    setToDelete(): void;

    getAngle(): number;
    setAngle(to: number): void;
    
    getHoldOffset(): Vector;
    getHandOffset(): Vector;
        
    getId(): number;
    
    draw(): void;
    drawTopLayer?(): void;
}

type ItemConstructor = new (pos: Vector, id: number) => IItem

function isItem(object: any): object is IItem {
    return object && 'throw' in object;
}

export { isItem };
export type { IItem, ItemConstructor };