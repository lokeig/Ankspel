import { Vector, Utility } from "@common";
import { ProjectileManager } from "@game/Projectile";

class FirearmInfo {

    public knockback = { x: 0, y: 0 };
    public bulletSize: number = 2;
    public bulletAngleVariation: number = 0;
    public bulletSpeed: number = 2300;
    public pipeOffset: Vector = { x: 0, y: 0 };
    public bulletLifespan: number = 0.2;
    public ammo: number = 10;

    public shoot(centerPos: Vector, angle: number, flip: boolean): void {

        if (this.ammo < 1) {
            return;
        }

        const direcMult = flip ? -1 : 1;
        this.ammo -= 1;
        const offset = Utility.Angle.rotateForce(this.pipeOffset, angle);
        const pos = { 
            x: centerPos.x + (offset.x * direcMult),
            y: centerPos.y + offset.y
        };

        const shotAngle = angle + (Math.random() * 2 - 1) * this.bulletAngleVariation;
        const speed = Utility.Angle.rotateForce({ x: this.bulletSpeed, y: 0 }, shotAngle);
        speed.x *= direcMult;
        ProjectileManager.addBullet({ x: pos.x - this.bulletSize / 2, y: pos.y - this.bulletSize / 2 }, this.bulletSize, speed, this.bulletLifespan);
        
    }
    
    public getKnockback(angle: number, flip: boolean): Vector {
        const result = Utility.Angle.rotateForce({ x: this.knockback.x, y: 0 }, angle);
        if (flip) {
            result.x *= -1;
        }
        if (angle === 0) {
            result.y += this.knockback.y;
        }        
        if (this.empty()) {
            this.knockback = { x: 0, y: 0 };
        }
        return result;
    }

    public empty(): boolean {
        return this.ammo < 1;
    }
}

export { FirearmInfo };