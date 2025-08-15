import { images } from "../../../Common/images";
import { SpriteSheet } from "../../../Common/Sprite/sprite";
import { Vector } from "../../../Common/Types/vector";
import { StaticTrail } from "./staticTrail";
import { Grid } from "../../../Common/grid";
import { Projectile } from "./projectile";


export class ProjectileManager {

    private static projectiles: Map<string, Set<Projectile>> = new Map();
    private static trails: Set<StaticTrail> = new Set();

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
        for (const projectileSet of this.projectiles.values()) {
            for (const projectile of projectileSet) {

                if (projectile.shouldBeDeleted()) {
                    projectileSet.delete(projectile);
                    projectile.trail.removing = true;
                    continue;
                }

                projectile.update(deltaTime);
            }
        }
        
        Grid.updateMapPositions<Projectile>(this.projectiles, e => e.body.pos);
    }


    public static getProjectiles(pos: Vector): Set<Projectile> | undefined{
        return this.projectiles.get(Grid.key(pos));
    }
    

    public static addBullet(pos: Vector, size: number, velocity: Vector, lifespan: number) {
        const gridPos = Grid.getGridPos(pos);
        const projectileSet = this.getProjectiles(gridPos);
        if (!projectileSet) {
            this.projectiles.set(Grid.key(gridPos), new Set());
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