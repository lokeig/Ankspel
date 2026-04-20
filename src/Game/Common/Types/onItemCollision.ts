import { Vector } from "@math";

enum OnItemCollisionType {
    Death,
    Sharp,
    Headbonk,
    Knockback,
    SteppedOn
}

type OnItemCollision =
    | { type: OnItemCollisionType.Death; }
    | { type: OnItemCollisionType.Sharp; }
    | { type: OnItemCollisionType.Knockback; amount: Vector }
    | { type: OnItemCollisionType.Headbonk; }
    | { type: OnItemCollisionType.SteppedOn; };


export { OnItemCollisionType };
export type { OnItemCollision };