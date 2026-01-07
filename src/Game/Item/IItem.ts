import { ItemInteraction, ThrowType, Vector } from "@common";
import { useFunction } from "./useFunction";
import { DynamicObject } from "@core";

interface IItem {
    update(deltaTime: number): void;
    draw(): void;
    getBody(): DynamicObject;
    interactions: Map<ItemInteraction, useFunction>;

    setOwnership(value: boolean): void;
    isOwned(): boolean;
    throw(throwType: ThrowType): void;

    shouldBeDeleted(): boolean;
    setToDelete(): void;

    getAngle(): number;
    setWorldAngle(to: number): void;
    setLocalAngle(angle: number): void;
    getLocalAngle(): number;

    getHoldOffset(): Vector;
    getHandOffset(): Vector;
}

type ItemConstructor = new (pos: Vector) => IItem

export type { IItem, ItemConstructor };