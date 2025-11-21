import { Vector } from "@common";
import { IItem } from "./IItem";

interface IFirearm extends IItem {
    shoot(): Vector;
}

interface IExplosive extends IItem {
    activate(): void;
}

export type { IFirearm, IExplosive };