import { images } from "../../../images";
import { rotateForce } from "../../Common/angleHelper";
import { Countdown } from "../../Common/cooldown";
import { SpriteSheet } from "../../Common/sprite";
import { Vector } from "../../Common/types";
import { ParticleHandler } from "../../Grid/particleHandler";
import { ProjectileHandler } from "../../Grid/projectileHandler";
import { ExplosionVFX } from "../../Particles/explosionVFX";
import { ItemInterface, ItemLogic } from "./itemLogic";

export class Grenade implements ItemInterface {
    public itemLogic: ItemLogic;
    private spriteSheet = new SpriteSheet(images.grenade, 16, 16);
    private drawSize: number = 32;
    private setToDelete: boolean = false;

    private explosionDelay = new Countdown(2);
    private activated: boolean = false;    

    constructor(pos: Vector) {
        this.itemLogic = new ItemLogic(pos, 15, 19);
        this.itemLogic.dynamicObject.bounceFactor = 0.3;

        this.itemLogic.holdOffset = { x: 12, y: -6 }
        this.itemLogic.setHitboxOffset({ x: 30, y: 30 });
    }

    update(deltaTime: number): void {
        if (this.activated) {
            this.explosionDelay.update(deltaTime); 
        }
        this.itemLogic.update(deltaTime);

        if (this.explosionDelay.isDone()) {

            ParticleHandler.addParticle(new ExplosionVFX(this.itemLogic.dynamicObject.getCenter()));
            this.setToDelete = true;

            const amountOfBullets = 16;
            for (let i = 0; i < amountOfBullets; i++) {
                const angle = i * 2 * Math.PI / amountOfBullets;
                const speed = rotateForce({ x: 2000, y: 0 }, angle)
                const size = 2;
                const lifespan = 0.06;
                const pos = this.itemLogic.dynamicObject.pos;
                ProjectileHandler.addBullet({x: pos.x, y: pos.y }, size, speed, lifespan);
            }
        }
    }

    interact(): void {
        this.activated = true;
    }

    draw(): void {
        const col = this.activated ? 1 : 0;
        this.spriteSheet.draw(0, col, this.itemLogic.getDrawpos(this.drawSize), this.drawSize, this.itemLogic.isFlip(), this.itemLogic.angle)
    }

    shouldBeDeleted(): boolean {
        return this.setToDelete;
    }
}