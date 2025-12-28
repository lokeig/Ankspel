import { Vector } from "@common";
import { IItem } from "./IItem";

interface IFirearm extends IItem {
    shoot(seed: number): Vector;
}

interface IExplosive extends IItem {
    activate(): void;
}

export type { IFirearm, IExplosive };