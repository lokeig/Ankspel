import { IProjectile } from "./IProjectile";
import { ITrail } from "./ITrail";

class ProjectileManager {
    private static projectiles: Set<IProjectile> = new Set();
    private static trails: Set<ITrail> = new Set();

    public static clear(): void {
        this.projectiles = new Set();
        this.trails = new Set();
    }

    public static update(deltaTime: number) {
        this.updateProjectiles(deltaTime);
        this.updateTrails(deltaTime);
    }

    private static updateProjectiles(deltaTime: number) {
        this.projectiles.forEach((projectile => {
            if (projectile.shouldBeDeleted()) {
                this.projectiles.delete(projectile);
                projectile.getTrail().setToDelete();
                return;
            }
            projectile.update(deltaTime);
            projectile.getTrail().setTarget(projectile.getPos());
        }));
    }

    private static updateTrails(deltaTime: number): void {
        this.trails.forEach(trail => {
            if (trail.shouldBeDeleted()) {
                this.trails.delete(trail);
            } else {
                trail.update(deltaTime);
            }
        });
    }

    public static addProjectile(newProjectile: IProjectile, local: boolean) {
        if (local) {
            newProjectile.setLocal();
        }
        this.projectiles.add(newProjectile);
        this.trails.add(newProjectile.getTrail());
    }

    public static getProjectiles(): IProjectile[] {
        return Array.from(this.projectiles);
    }

    public static draw() {
        this.trails.forEach(trail => { trail.draw(); });
        this.projectiles.forEach(projectile => {
            projectile.draw();
        });
    }
}

export { ProjectileManager };