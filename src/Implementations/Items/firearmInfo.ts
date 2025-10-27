import { Vector, Utility } from "@common";
import { ProjectileManager } from "@game/Projectile";
import { Bullet } from "@impl/Projectiles";

class FirearmInfo {

    public knockback = { x: 0, y: 0 };
    public bulletAngleVariation: number = 0;
    public bulletSpeed: number = 2300;
    public pipeOffset: Vector = { x: 0, y: 0 };
    public bulletLifespan: number = 0.2;
    public ammo: number = 10;
    public bulletCount: number = 1;

    public shoot(centerPos: Vector, angle: number, flip: boolean): Vector {

        if (this.ammo < 1) {
            return { x: 0, y: 0 };
        }

        const direcMult = flip ? -1 : 1;
        this.ammo -= 1;
        const offset = Utility.Angle.rotateForce(this.pipeOffset, angle);
        const pos = { 
            x: centerPos.x + (offset.x * direcMult),
            y: centerPos.y + offset.y
        };

        for (let i = 0; i < this.bulletCount; i++) {
            const shotAngle = angle + Utility.Random.getRandomNumber(-this.bulletAngleVariation, this.bulletAngleVariation);
            const speed = Utility.Angle.rotateForce({ x: this.bulletSpeed, y: 0 }, shotAngle);
            speed.x *= direcMult;
            ProjectileManager.addProjectile(new Bullet({...pos}, speed, this.bulletLifespan));
        }
        return this.getKnockback(angle, flip);
    }
    
    public getKnockback(angle: number, flip: boolean): Vector {
        const result = Utility.Angle.rotateForce({ x: this.knockback.x, y: 0 }, angle);
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