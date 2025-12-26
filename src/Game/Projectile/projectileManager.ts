import { Grid, Vector } from "@common";
import { IProjectile, ProjectileConstructor } from "./IProjectile";
import { ITrail } from "./ITrail";
import { Connection, GameMessage } from "@server";

class ProjectileManager {
    private static projectiles: Map<string, Set<IProjectile>> = new Map();
    private static IDToProjectile: Map<number, IProjectile> = new Map();
    private static projectileToID: Map<IProjectile, number> = new Map();
    private static trails: Set<ITrail> = new Set();

    private static register: Map<string, ProjectileConstructor> = new Map();
    private static projectileIndex = 0;

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
                projectile.getTrail().setTarget(projectile.body.getCenter());
                projectile.update(deltaTime);
            }
        }
        Grid.updateMapPositions<IProjectile>(this.projectiles, e => e.body.pos);
    }

    public static registerProjectile(type: string, constructor: ProjectileConstructor): void {
        this.register.set(type, constructor);
    }

    private static setProjectileID(item: IProjectile, id: number) {
        this.projectileToID.set(item, id);
        this.IDToProjectile.set(id, item);
    }

    public static create(type: string, pos: Vector, angle: number): IProjectile | null {
        const constructor = this.register.get(type);
        if (!constructor) {
            return null;
        }
        const result = new constructor(pos, angle);
        this.addProjectile(result);
        this.setProjectileID(result, this.projectileIndex++);
        Connection.get().sendGameMessage(GameMessage.spawnProjectile, { id: this.projectileIndex, location: pos, type, angle });
        return result;
    }

    public static spawn(type: string, pos: Vector, angle: number, id: number): void {
        pos = new Vector(pos.x, pos.y);
        const constructor = this.register.get(type);
        if (!constructor) {
            return;
        }
        const newProjectile = new constructor(pos, angle);
        this.addProjectile(newProjectile);
        this.setProjectileID(newProjectile, id);
    }

    public static getProjectiles(pos: Vector): Set<IProjectile> | undefined {
        return this.projectiles.get(Grid.key(pos));
    }

    private static addProjectile(newProjectile: IProjectile) {
        const gridPos = Grid.getGridPos(newProjectile.body.pos);
        const projectileSet = this.getProjectiles(gridPos);
        if (!projectileSet) {
            this.projectiles.set(Grid.key(gridPos), new Set());
        }
        this.getProjectiles(gridPos)!.add(newProjectile);
        this.trails.add(newProjectile.getTrail());
    }

    public static getProjectileFromID(id: number): IProjectile | undefined {
        return this.IDToProjectile.get(id);
    }

    public static getProjectileID(item: IProjectile): number | undefined {
        return this.projectileToID.get(item);
    }

    public static getNearbyProjectiles(pos: Vector, width: number, height: number): IProjectile[] {
        const result: IProjectile[] = [];

        const startX = pos.x - Grid.size * 2;
        const endX = pos.x + width + Grid.size * 2;
        const startY = pos.y - Grid.size * 2;
        const endY = pos.y + height + Grid.size * 2;

        for (let x = startX; x < endX; x += Grid.size) {
            for (let y = startY; y < endY; y += Grid.size) {
                const gridPos = Grid.getGridPos(new Vector(x, y));
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
        for (const trail of this.trails.values()) {
            trail.draw();
        }
        for (const projectileArray of this.projectiles.values()) {
            for (const projectile of projectileArray) {
                projectile.draw();
            }
        }
    }
}

export { ProjectileManager };