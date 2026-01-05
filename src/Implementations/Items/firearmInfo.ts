import { Vector, Utility, SeededRNG } from "@common";
import { ProjectileManager } from "@game/Projectile";
import { OnItemUseEffect, OnItemUseType } from "@item";

class FirearmInfo {
    public knockback = new Vector();
    public bulletAngleVariation: number = 0;
    public pipeOffset = new Vector();
    public ammo: number = 10;
    public bulletCount: number = 1;
    public projectile!: string;

    public shoot(centerPos: Vector, angle: number, flip: boolean, seed: number): OnItemUseEffect[] {
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
            ProjectileManager.create(this.projectile, pos, shotAngle);
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

export { FirearmInfo };