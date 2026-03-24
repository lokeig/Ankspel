import { ProjectileEffect } from "@common";
import { DynamicObject } from "@core";
import { Vector } from "@math";
import { ProjectileManager, ProjectileTarget } from "@projectile";
import { Connection, GameMessage } from "@server";

class ItemProjectileCollision {
    private target: ProjectileTarget;

    private handleEffectCallback: (effect: ProjectileEffect, pos: Vector) => void;

    constructor(body: DynamicObject, id: number, resistence: number, onHit: (effect: ProjectileEffect, pos: Vector, local: boolean) => void, enabled: () => boolean) {
        this.target = {
            body: () => body,
            penetrationResistance: () => resistence,
            onProjectileHit: (effects, pos, local) => effects.forEach(effect => {
                onHit(effect, pos, local);
                if (local) {
                    Connection.get().sendGameMessage(GameMessage.ItemProjectileEffect, { id, effect, pos });
                }
            }),
            enabled,
        };

        ProjectileManager.addCollidable(this.target);

        this.handleEffectCallback = (effect, pos) => onHit(effect, pos, true);
    }

    public handleEffect(effect: ProjectileEffect, pos: Vector): void {
        this.handleEffectCallback(effect, pos);
    }

    public enable(): void {
        ProjectileManager.addCollidable(this.target);
    }

    public disable(): void {
        ProjectileManager.removeCollidable(this.target);
    }
}

export { ItemProjectileCollision };