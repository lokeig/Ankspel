import { Vector } from "@math";

enum OnItemCollisionType {
    Death,
    Sharp,
    DropItem,
    Headbonk,
    Knockback
}

type OnItemCollision =
    | { type: OnItemCollisionType.Death; }
    | { type: OnItemCollisionType.Sharp; }
    | { type: OnItemCollisionType.Knockback; amount: Vector }
    | { type: OnItemCollisionType.Headbonk; };

export { OnItemCollisionType };
export type { OnItemCollision };