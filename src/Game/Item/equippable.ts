import { PlayerAnim, ProjectileEffect } from "@common";
import { Vector } from "@math";
import { IItem } from "./IItem";

interface Equippable extends IItem {
    onEquip(): void;
    onUnequip(): void;
    defensive(): boolean;
    onProjectileEffect(effect: ProjectileEffect, pos: Vector, local: boolean): void;
    onPlayerAnimation(anim: PlayerAnim, holding: boolean): void;
    takeDamage(): void;
}

function isEquippable(object: any): object is Equippable {
    return object && 'onEquip' in object;
}

export { isEquippable };
export type { Equippable }