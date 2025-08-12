import { images } from "../../images";
import { SpriteSheet } from "../Common/sprite";
import { Vector } from "../Common/types";
import { Projectile } from "../DynamicObjects/projectile";
import { StaticTrail } from "../DynamicObjects/staticTrail";
import { GridHelper } from "./gridHelper";


export class ProjectileHandler {

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
        GridHelper.updateMapPositions<Projectile>(this.projectiles, e => e.body.pos);
    }


    public static getProjectiles(pos: Vector): Set<Projectile> | undefined{
        return this.projectiles.get(GridHelper.key(pos));
    }
    

    public static addBullet(pos: Vector, size: number, velocity: Vector, lifespan: number) {
        const gridPos = GridHelper.getGridPos(pos);
        const projectileSet = this.getProjectiles(gridPos);
        if (!projectileSet) {
            this.projectiles.set(GridHelper.key(gridPos), new Set());
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