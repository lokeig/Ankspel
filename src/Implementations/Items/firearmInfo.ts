import { Vector, Utility, SeededRNG } from "@common";
import { ProjectileManager } from "@game/Projectile";
import { Bullet } from "@impl/Projectiles";
import { OnItemUseEffect, OnItemUseType } from "@item";

class FirearmHelper {
    public knockback = new Vector();
    public bulletAngleVariation: number = 0;
    public pipeOffset = new Vector();
    public ammo: number = 10;
    public bulletCount: number = 1;
    public bulletSpeed: number = 1000;
    public bulletRange: number = 10;
    public bulletRangeVariation: number = 0;

    public shoot(centerPos: Vector, angle: number, flip: boolean, seed: number, local: boolean): OnItemUseEffect[] {
        const rng = new SeededRNG(seed);
        if (this.ammo < 1) {
            return [];
        }
        const direcMult = flip ? -1 : 1;
        this.ammo -= 1;
        const offset = Utility.Angle.rotateForce(this.pipeOffset, angle);
        const pos = new Vector(
            centerPos.x + offset.x * direcMult,
            centerPos.y + offset.y
        );
        for (let i = 0; i < this.bulletCount; i++) {
            let shotAngle = angle + rng.getInRange(-this.bulletAngleVariation, this.bulletAngleVariation);
            shotAngle = flip ? Math.PI - shotAngle : shotAngle;
            const range = this.bulletRange + rng.getInRange(-this.bulletRangeVariation, this.bulletRangeVariation);
            const bullet = new Bullet(pos.clone(), shotAngle, this.bulletSpeed, range);
            ProjectileManager.addProjectile(bullet, local);
        }
        return [{ type: OnItemUseType.Knockback, value: this.getKnockback(angle, flip) }]; 
    }

    public getKnockback(angle: number, flip: boolean): Vector {
        const result = Utility.Angle.rotateForce(new Vector(this.knockback.x, 0), angle);
        if (flip) {
            result.x *= -1;
        }
        if (angle === 0) {
            result.y += this.knockback.y;
        }
        return result;
    }
}

export { FirearmHelper };