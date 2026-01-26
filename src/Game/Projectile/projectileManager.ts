import { Grid, Vector } from "@common";
import { IProjectile, ProjectileConstructor } from "./IProjectile";
import { ITrail } from "./ITrail";

class ProjectileManager {
    private static projectiles: Map<string, Set<IProjectile>> = new Map();
    private static pending: IProjectile[] = [];
    private static trails: Set<ITrail> = new Set();
    private static register: Map<string, ProjectileConstructor> = new Map();

    public static update(deltaTime: number) {
        this.pending.forEach(projectile => {
            this.getProjectiles(Grid.getGridPos(projectile.getPos()))!.add(projectile);
        });
        this.pending = [];
        this.updateMapPositions(deltaTime);
        this.trails.forEach(trail => {
            if (trail.shouldBeDeleted()) {
                this.trails.delete(trail);
            } else {
                trail.update(deltaTime);
            }
        });
    }

    private static updateMapPositions(deltaTime: number) {
        this.projectiles.forEach(projectileSet => projectileSet.forEach(projectile => {
            if (projectile.shouldBeDeleted()) {
                projectileSet.delete(projectile);
                projectile.getTrail().setToDelete();
                return;
            }
            projectile.update(deltaTime);
            projectile.getTrail().setTarget(projectile.getPos());
        }));
        Grid.updateMapPositions<IProjectile>(this.projectiles, e => e.getPos());
    }

    public static registerProjectile(type: string, constructor: ProjectileConstructor): void {
        this.register.set(type, constructor);
    }

    public static create(type: string, pos: Vector, angle: number, local: boolean, seed?: number): IProjectile | null {
        const constructor = this.register.get(type);
        if (!constructor) {
            return null;
        }
        const result = new constructor(pos, angle, seed);
        this.addProjectile(result);
        if (local) {
            result.setLocal();
        }
        return result;
    }

    public static spawn(type: string, pos: Vector, angle: number, seed: number): void {
        pos = new Vector(pos.x, pos.y);
        const constructor = this.register.get(type);
        if (!constructor) {
            return;
        }
        const newProjectile = new constructor(pos, angle, seed);
        this.addProjectile(newProjectile);
    }

    public static getProjectiles(pos: Vector): Set<IProjectile> | undefined {
        return this.projectiles.get(Grid.key(pos));
    }

    private static addProjectile(newProjectile: IProjectile) {
        const gridPos = Grid.getGridPos(newProjectile.getPos());
        const projectileSet = this.getProjectiles(gridPos);
        if (!projectileSet) {
            this.projectiles.set(Grid.key(gridPos), new Set());
        }
        this.pending.push(newProjectile);
        this.trails.add(newProjectile.getTrail());
    }

    public static getNearbyProjectiles(pos: Vector, width: number, height: number, nextPos: Vector = pos): IProjectile[] {
        const result: IProjectile[] = [];

        const accumulate = (gridPos: Vector) => {
            const projectilSet = this.getProjectiles(gridPos);
            if (!projectilSet) {
                return;
            }
            projectilSet.forEach(projectile => {
                result.push(projectile);
            });
        }

        Grid.forNearby(pos, nextPos, width, height, accumulate);
        return result;
    }

    public static draw() {
        this.trails.forEach(trail => { trail.draw(); });
        this.projectiles.forEach(projectileSet => projectileSet.forEach(projectile => {
            projectile.draw();
        }));
    }
}

export { ProjectileManager };