import { Grid, Vector } from "@common";
import { ProjectileInterface } from "./projectileInterface";
import { TrailInterface } from "./trailInterface";

class ProjectileManager {
    private static projectiles: Map<string, Set<ProjectileInterface>> = new Map();
    private static trails: Set<TrailInterface> = new Set();

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

        Grid.updateMapPositions<ProjectileInterface>(this.projectiles, e => e.body.pos);
    }


    public static getProjectiles(pos: Vector): Set<ProjectileInterface> | undefined {
        return this.projectiles.get(Grid.key(pos));
    }


    public static addProjectile(newProjectile: ProjectileInterface) {
        const gridPos = Grid.getGridPos(newProjectile.body.pos);
        const projectileSet = this.getProjectiles(gridPos);
        if (!projectileSet) {
            this.projectiles.set(Grid.key(gridPos), new Set());
        }
        this.getProjectiles(gridPos)!.add(newProjectile);
        this.trails.add(newProjectile.getTrail());

    }

    public static getNearbyProjectiles(pos: Vector, width: number, height: number): ProjectileInterface[] {
        const result: ProjectileInterface[] = [];

        const startX = pos.x - Grid.gridSize * 2;
        const endX = pos.x + width + Grid.gridSize * 2;
        const startY = pos.y - Grid.gridSize * 2;
        const endY = pos.y + height + Grid.gridSize * 2;

        for (let x = startX; x < endX; x += Grid.gridSize) {
            for (let y = startY; y < endY; y += Grid.gridSize) {
                const gridPos = Grid.getGridPos({ x, y });

                this.processProjectileSet(gridPos, result);
            }
        }

        return result;
    }

    private static processProjectileSet(gridPos: Vector, accumulatedItems: Array<ProjectileInterface>): void {
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