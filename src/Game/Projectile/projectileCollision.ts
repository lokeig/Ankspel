import { GameObject } from "@core";
import { ProjectileManager } from "./projectileManager";
import { Vector } from "@common";

class ProjectileCollision {
    private affectedBody: GameObject;
    private onHit!: (hitPos: Vector) => void;

    constructor(body: GameObject) {
        this.affectedBody = body;
    }

    public setOnHit(fn: (hitPos: Vector) => void): void {
        this.onHit = fn;
    }

    public check(): void {
        const nearbyProjectiles = ProjectileManager.getNearbyProjectiles(this.affectedBody.pos, this.affectedBody.width, this.affectedBody.height);
        for (const projectile of nearbyProjectiles) {
            if (this.affectedBody.collision(projectile.getBody())) {
                this.onHit(projectile.getBody().pos);
            }
        }
    }
}

export { ProjectileCollision };