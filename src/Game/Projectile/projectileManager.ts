import { IProjectile, ProjectileTarget } from "./IProjectile";
import { ITrail } from "./ITrail";

class ProjectileManager {
    private static projectiles: Set<IProjectile> = new Set();
    private static trails: Set<ITrail> = new Set();
    private static targets: Set<ProjectileTarget> = new Set();

    public static clear(): void {
        this.projectiles = new Set();
        this.trails = new Set();
    }

    public static update(deltaTime: number) {
        this.updateProjectiles(deltaTime);
        this.updateTrails(deltaTime);
    }

    private static updateProjectiles(deltaTime: number) {
        const targets = Array.from(this.targets);

        for (const projectile of this.projectiles) {
            if (projectile.shouldBeDeleted()) {
                projectile.getTrail().setToDelete();
                this.projectiles.delete(projectile);
                continue;
            }

            projectile.update(deltaTime, targets);
            projectile.getTrail().setTarget(projectile.getPos());
        }
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

    public static addCollidable(target: ProjectileTarget): void {
        this.targets.add(target);
    }

    public static removeCollidable(target: ProjectileTarget) {
        this.targets.delete(target);
    }

    public static draw() {
        this.trails.forEach(trail => { trail.draw(); });
        this.projectiles.forEach(projectile => { projectile.draw(); });
    }
}

export { ProjectileManager };