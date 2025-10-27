import { GameObject } from "@core";
import { ProjectileManager } from "./projectileManager";

class ProjectileCollision {
    private affectedBody: GameObject;
    private onHit!: () => void;

    constructor(body: GameObject) {
        this.affectedBody = body;
    }

    public setOnHit(fn: () => void): void {
        this.onHit = fn;
    }

    public check(): void {
        const nearbyProjectiles = ProjectileManager.getNearbyProjectiles(this.affectedBody.pos, this.affectedBody.width, this.affectedBody.height);
        for (const projectile of nearbyProjectiles) {
            if (this.affectedBody.collision(projectile.body)) {
                this.onHit();
            }
        }
    }
}

export { ProjectileCollision };