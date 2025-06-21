import { images } from "../../images";
import { SpriteSheet } from "../Common/sprite";
import { Vector } from "../Common/types";
import { Projectile, StaticTrail } from "../DynamicObjects/projectile";
import { CollisionObject, StaticObject } from "../StaticObjects/staticObject";
import { TileHandler } from "./tileHandler";


export class ProjectileHandler {

    private static projectiles: Map<string, Set<Projectile>> = new Map();
    private static gridSize: number;
    private static trails: Set<StaticTrail> = new Set();

    static init(gridSize: number) {
        this.gridSize = gridSize;
    }

    public static update(deltaTime: number) {
        this.updateMapPositions(deltaTime);
        
        for (const trail of this.trails) {
            trail.update(deltaTime);
            if (trail.setToRemove) {
                this.trails.delete(trail);
            }
        }
    }

    private static updateMapPositions(deltaTime: number) {
        const movedprojectiles: Map<string, Set<Projectile>> = new Map();
        for (const [key, projectileSet] of this.projectiles.entries()) {
            for (const projectile of projectileSet) {
                if (projectile.shouldBeDeleted()) {
                    projectileSet.delete(projectile);
                    projectile.trail.removing = true;
                    continue;
                }

                this.setNearby(projectile);
                projectile.update(deltaTime);

                const newKey = this.key(this.getGridPos(projectile.body.pos));

                if (key !== newKey) {
                    projectileSet.delete(projectile);

                    if (!movedprojectiles.has(newKey)) {
                        movedprojectiles.set(newKey, new Set());
                    }
                    movedprojectiles.get(newKey)!.add(projectile);
                }
            }

            if (projectileSet.size === 0) {
                this.projectiles.delete(key);
            }
        }

        // Merges moved projectiles into projectiles Map
        for (const [newKey, projectileSet] of movedprojectiles.entries()) {
            if (!this.projectiles.has(newKey)) {
                this.projectiles.set(newKey, new Set());
            }
            for (const projectile of projectileSet) {
                this.projectiles.get(newKey)!.add(projectile);
            }
        }
    }

    private static getGridPos(pos: Vector): Vector {
        return { x: Math.floor(pos.x / this.gridSize), y: Math.floor(pos.y / this.gridSize) }
    }

    private static getWorldPos(gridPos: Vector): Vector {
        return { x: gridPos.x * this.gridSize, y: gridPos.y * this.gridSize } 
    }

    private static key(pos: Vector): string {
        return `${pos.x},${pos.y}`;
    }

    public static getProjectiles(pos: Vector): Set<Projectile> | undefined{
        return this.projectiles.get(this.key(pos));
    }
    

    private static setNearby(projectile: Projectile): void {
        const nearbyCollidable: CollisionObject[] = [];
    
        const body = projectile.body;
        const startX = body.pos.x - this.gridSize * 2;
        const endX = body.pos.x + body.width + this.gridSize * 2;
        const startY = body.pos.y - this.gridSize * 2;
        const endY = body.pos.y + body.height + this.gridSize * 2;
    
        for (let x = startX; x < endX; x += this.gridSize) {
            for (let y = startY; y < endY; y += this.gridSize) {
                const gridPos = this.getGridPos({ x, y });
    
                this.processTile(TileHandler.getTile(gridPos), nearbyCollidable);
            }
        }
    
       body.collidableObjects = nearbyCollidable;
    }

    private static processTile(tile: StaticObject | undefined, accumulatedCollidable: Array<CollisionObject>): void {
        if (!tile) return;
    
        accumulatedCollidable.push({ gameObject: tile, platform: tile.platform });
    
        if (tile.lipLeft) {
            accumulatedCollidable.push({ gameObject: tile.lipLeft, platform: true });
        }
    
        if (tile.lipRight) {
            accumulatedCollidable.push({ gameObject: tile.lipRight, platform: true });
        }
    }

    public static addBullet(pos: Vector, size: number, velocity: Vector, lifespan: number) {
        const gridPos = this.getGridPos(pos);
        const projectileSet = this.getProjectiles(gridPos);
        if (!projectileSet) {
            this.projectiles.set(this.key(gridPos), new Set());
        } 
        const trail = new StaticTrail({ x: pos.x + size / 2, y: pos.y + size / 2}, velocity, 100, size);
        trail.setTarget({ x: pos.x + size / 2, y: pos.y + size / 2});
        this.trails.add(trail);

        const result = new Projectile(pos, velocity, lifespan, size, new SpriteSheet(images.bullet, 8, 1));
        result.trail = trail;
        this.getProjectiles(gridPos)!.add(result);
 
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