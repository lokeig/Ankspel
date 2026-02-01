import { ThrowType, Vector } from "@common";
import { DynamicObject } from "@core";
import { Ownership } from "./itemUseType";
import { ItemUseInteractions } from "./itemUseInteractions";

interface IItem {
    update(deltaTime: number): void;
    draw(): void;
    getBody(): DynamicObject;
    interactions(): ItemUseInteractions;

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
}

type ItemConstructor = new (pos: Vector) => IItem

export type { IItem, ItemConstructor };