import { Vector } from "@math";
import { SpriteSheet, ItemInteraction, Countdown } from "@common";
import { OnItemUseEffect, Ownership } from "@game/Item";
import { Item } from "./item";
import { Images } from "@render";
import { FirearmHelper } from "./firearmHelper";
import { ProjectileManager } from "@projectile";
import { Missile } from "@impl/Projectiles";

class Bazooka extends Item {
    private static sprite = new SpriteSheet(Images.bazooka);
    private static handOffset = new Vector(2, 2);
    private static holdOffset = new Vector(10, -4);
    private firearmInfo!: FirearmHelper;
    private reloading = new Countdown(1);
    private isReloading: boolean = false;

    constructor(pos: Vector, id: number) {
        const width = 30;
        const height = 15;
        super(pos, width, height, id);

        this.info.holdOffset = Bazooka.holdOffset;
        this.info.handOffset = Bazooka.handOffset;

        this.setupFirearmInfo();
        this.playerInteractions.setUse(ItemInteraction.Activate, ((seed: number, local: boolean) => {
            return this.shoot(seed, local);
        }));
        this.reloading.setToReady();
    }

    private setupFirearmInfo(): void {
        this.firearmInfo = new FirearmHelper();
        this.firearmInfo.ammo = Infinity;
        this.firearmInfo.bulletAngleVariation = 0;
        this.firearmInfo.knockback = new Vector(650, 220);
        this.firearmInfo.muzzleOffset = new Vector(23, -6);

        this.firearmInfo.createBullet = (pos, angle, local, range) => {
            ProjectileManager.addProjectile(new Missile(pos, angle), local);
        }
    }

    public update(deltaTime: number): void {
        if (this.reloading.isDone()) {
            this.isReloading = false;
        }
        if (this.isReloading) {
            this.reloading.update(deltaTime);
        } else {
            this.reloading.reset();
        }
        if (this.ownership === Ownership.None) {
            this.isReloading = false;
        }
        const percent = this.reloading.getPercentageReady();
        let localAngle = -Math.sin((percent * Math.PI)) * 1.5;
        this.angle.localAngle = localAngle;
        super.update(deltaTime);
    }

    public shoot(seed: number, local: boolean): OnItemUseEffect[] {
        if (!this.isReloading) {
            this.isReloading = true;
            return this.firearmInfo.shoot(this.body.getCenter(), this.getAngle(), this.body.isFlip(), seed, local);
        } else {;
            return [];
        }
    }

    public draw(): void {
        const drawSize = new Vector(60, 26);
        Bazooka.sprite.draw(this.getDrawPos(drawSize), drawSize, this.body.isFlip(), this.getAngle(), this.getZIndex());
    }
}

export { Bazooka };