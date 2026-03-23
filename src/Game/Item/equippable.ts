import { PlayerAnim, ProjectileEffect } from "@common";
import { Vector } from "@math";

interface Equippable {
    onEquip(): void;
    onUnequip(): void;
    tanksHeavyProp(): boolean;
    blocksSharpObject(): boolean;
    onProjectileEffect(effect: ProjectileEffect, pos: Vector, local: boolean): void;
    onPlayerAnimation(anim: PlayerAnim, holding: boolean): void;
}

function isEquippable(object: any): object is Equippable {
    return object && 'onEquip' in object;
}

export { isEquippable };
export type { Equippable }