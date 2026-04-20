import { Vector } from "@math";
import { Utility, SeededRNG } from "@common";
import { ProjectileManager } from "@game/Projectile";
import { Bullet } from "@impl/Projectiles";
import { OnItemUseEffect, OnItemUseType } from "@item";

class FirearmHelper {
    public knockback = new Vector();
    public bulletAngleVariation: number = 0;
    public muzzleOffset = new Vector();
    public ammo: number = 10;
    public bulletCount: number = 1;
    public bulletSpeed: number = 1000;
    public bulletRange: number = 10;
    public bulletRangeVariation: number = 0;
    public createBullet: (pos: Vector, angle: number, local: boolean, range: number) => void = () => { };

    constructor() {
        this.createBullet = (pos, angle, local, range) =>
            ProjectileManager.addProjectile(new Bullet(pos, angle, this.bulletSpeed, range), local);
    }

    public shoot(centerPos: Vector, angle: number, flip: boolean, seed: number, local: boolean): OnItemUseEffect[] {
        if (this.ammo < 1) {
            return [];
        }
        this.ammo--;

        const rng = new SeededRNG(seed);
        const baseAngle = flip ? Math.PI - angle : angle;

        for (let i = 0; i < this.bulletCount; i++) {
            const shotAngle = baseAngle + rng.getInRange(-this.bulletAngleVariation, this.bulletAngleVariation);
            const range = this.bulletRange + rng.getInRange(-this.bulletRangeVariation, this.bulletRangeVariation);

            this.createBullet(this.getMuzzleOffset(centerPos, angle, flip), shotAngle, local, range);
        }
        return [{ type: OnItemUseType.Knockback, value: this.getKnockback(angle, flip) }];
    }

    public getMuzzleOffset(center: Vector, angle: number, flip: boolean): Vector {
        const muzzleOffset = Utility.Angle.rotateForce(this.muzzleOffset, angle);
        const directionalMultiplier = flip ? -1 : 1;

        return new Vector(
            center.x + muzzleOffset.x * directionalMultiplier,
            center.y + muzzleOffset.y
        );
    }

    private getKnockback(angle: number, flip: boolean): Vector {
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