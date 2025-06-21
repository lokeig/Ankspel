import { rotateForce } from "../../Common/angleHelper";
import { Vector } from "../../Common/types";
import { ProjectileHandler } from "../../Grid/projectileHandler";

export class FirearmInfo {

    public knockback = { x: 0, y: 0 };
    public bulletSize: number = 2;
    public bulletFireAmount: number = 1;
    public bulletAngleVariation: number = 0;
    public bulletSpeed: number = 1000;
    public pipeOffset: Vector = { x: 0, y: 0 };
    public bulletLifespan: number = 1;
    public ammo: number = 10;

    public shoot(centerPos: Vector, angle: number, flip: boolean): void {
        if (this.ammo < 1) {
            return;
        }
        const direcMult = flip ? -1 : 1;
        this.ammo -= 1;
        const offset = rotateForce(this.pipeOffset, angle);
        const pos = { 
            x: centerPos.x + (offset.x * direcMult),
            y: centerPos.y + offset.y
        };

        for (let i = 0; i < this.bulletFireAmount; i++) {  
            const shotAngle = angle + (Math.random() * 2 - 1) * this.bulletAngleVariation;
            const speed = rotateForce({ x: this.bulletSpeed, y: 0 }, shotAngle);
            speed.x *= direcMult;
            ProjectileHandler.addBullet({ x: pos.x - this.bulletSize / 2, y: pos.y - this.bulletSize / 2 }, this.bulletSize, speed, this.bulletLifespan);
        }
    }
    
    public getKnockback(angle: number, flip: boolean): Vector {
        const result = rotateForce({ x: this.knockback.x, y: 0 }, angle);
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