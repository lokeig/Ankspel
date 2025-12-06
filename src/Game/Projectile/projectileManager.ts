import { Grid, Vector } from "@common";
import { IProjectile } from "./IProjectile";
import { ITrail } from "./ITrail";

class ProjectileManager {
    private static projectiles: Map<string, Set<IProjectile>> = new Map();
    private static trails: Set<ITrail> = new Set();

    public static update(deltaTime: number) {
        this.updateMapPositions(deltaTime);

        for (const trail of this.trails) {
            trail.update(deltaTime);
            if (trail.shouldBeDeleted()) {
                this.trails.delete(trail);
            }
        }
    }

    private static updateMapPositions(deltaTime: number) {
        for (const projectileSet of this.projectiles.values()) {
            for (const projectile of projectileSet) {

                if (projectile.shouldBeDeleted()) {
                    projectileSet.delete(projectile);
                    projectile.getTrail().setToDelete();
                    continue;
                }

                projectile.update(deltaTime);
            }
        }

        Grid.updateMapPositions<IProjectile>(this.projectiles, e => e.body.pos);
    }


    public static getProjectiles(pos: Vector): Set<IProjectile> | undefined {
        return this.projectiles.get(Grid.key(pos));
    }


    public static addProjectile(newProjectile: IProjectile) {
        const gridPos = Grid.getGridPos(newProjectile.body.pos);
        const projectileSet = this.getProjectiles(gridPos);
        if (!projectileSet) {
            this.projectiles.set(Grid.key(gridPos), new Set());
        }
        this.getProjectiles(gridPos)!.add(newProjectile);
        this.trails.add(newProjectile.getTrail());

    }

    public static getNearbyProjectiles(pos: Vector, width: number, height: number): IProjectile[] {
        const result: IProjectile[] = [];

        const startX = pos.x - Grid.size * 2;
        const endX = pos.x + width + Grid.size * 2;
        const startY = pos.y - Grid.size * 2;
        const endY = pos.y + height + Grid.size * 2;

        for (let x = startX; x < endX; x += Grid.size) {
            for (let y = startY; y < endY; y += Grid.size) {
                const gridPos = Grid.getGridPos({ x, y });

                this.processProjectileSet(gridPos, result);
            }
        }

        return result;
    }

    private static processProjectileSet(gridPos: Vector, accumulatedItems: Array<IProjectile>): void {
        const projectilSet = this.getProjectiles(gridPos);

        if (!projectilSet) {
            return;
        }

        for (const item of projectilSet.values()) {
            accumulatedItems.push(item);
        }
    }

    public static draw() {
        for (const projectileArray of this.projectiles.values()) {
            for (const projectile of projectileArray) {
                projectile.draw();
            }
        }
        for (const trail of this.trails.values()) {
            trail.draw();
        }
    }
}

export { ProjectileManager };