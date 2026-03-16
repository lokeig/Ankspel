import { Vector } from "@math";

enum ProjectileEffectType {
    Damage,
    Knockback,
    Explosion,
    Poison,
    Net,
    NewProjectile
}

type ProjectileEffect =
    | { type: ProjectileEffectType.Damage; }
    | { type: ProjectileEffectType.Knockback; amount: Vector }
    | { type: ProjectileEffectType.Explosion; radius: number }
    | { type: ProjectileEffectType.Poison; duration: number; dps: number }
    | { type: ProjectileEffectType.Net; duration: number };

export { ProjectileEffectType };
export type { ProjectileEffect };