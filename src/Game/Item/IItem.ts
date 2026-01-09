import { ItemInteraction, ThrowType, Vector } from "@common";
import { useFunction } from "./useFunction";
import { DynamicObject } from "@core";
import { Ownership } from "./itemUseType";

interface IItem {
    update(deltaTime: number): void;
    draw(): void;
    getBody(): DynamicObject;
    interactions: Map<ItemInteraction, useFunction>;

    setOwnership(value: Ownership): void;
    getOwnership(): Ownership;
    throw(throwType: ThrowType): void;

    shouldBeDeleted(): boolean;
    setToDelete(): void;

    getAngle(): number;
    setWorldAngle(to: number): void;

    getHoldOffset(): Vector;
    getHandOffset(): Vector;
}

type ItemConstructor = new (pos: Vector) => IItem

export type { IItem, ItemConstructor };