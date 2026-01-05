import { ThrowType, Vector } from "@common";
import { ItemControls } from "./itemControls";
import { DynamicObject } from "@core";

interface IItem {
    update(deltaTime: number): void;
    draw(): void;
    getBody(): DynamicObject;
    interactions: ItemControls;

    setOwnership(value: boolean): void;
    isOwned(): boolean;
    throw(throwType: ThrowType): void;

    shouldBeDeleted(): boolean;
    setToDelete(): void;

    getAngle(): number;
    setWorldAngle(to: number): void;
    getLocalAngle(): number;

    getHoldOffset(): Vector;
    getHandOffset(): Vector;
}

type ItemConstructor = new (pos: Vector) => IItem

export type { IItem, ItemConstructor };