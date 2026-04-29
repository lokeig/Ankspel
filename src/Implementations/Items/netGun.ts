import { Frame, ItemInteraction, SpriteSheet, Utility } from "@common";
import { Item } from "./item";
import { Vector } from "@math";
import { Images } from "@render";
import { OnItemUseEffect, OnItemUseType } from "@item";
import { AudioManager, Sound } from "@game/Audio";
import { ProjectileManager } from "@projectile";
import { Net } from "@impl/Projectiles";

class NetGun extends Item {
    private static baseSprite: SpriteSheet;
    private static gaugeSprite: SpriteSheet;

    private static handOffset = new Vector(2, 2);
    private static holdOffset = new Vector(10, -4);
    private static gaugeFrames: Array<Frame> = new Array(4);
    private static muzzleOffset = new Vector(30, 0);
    private static knockback = new Vector(700, 200);

    private ammo: number = 4;

    static {
        this.baseSprite = new SpriteSheet(Images.netGun);
        this.gaugeSprite = new SpriteSheet(Images.netGunGuage);

        for (let i = 0; i < 4; i++) {
            NetGun.gaugeFrames[i] = new Frame(0, i);
        }
    }

    constructor(pos: Vector, id: number) {
        const width = 30;
        const height = 15;
        super(pos, width, height, id);

        this.info.holdOffset = NetGun.holdOffset;
        this.info.handOffset = NetGun.handOffset;

        this.playerInteractions.setUse(ItemInteraction.Activate, ((seed: number, local: boolean) => {
            return this.shoot(seed, local);
        }));
    }

    private getMuzzlePos(): Vector {
        const center = this.body.getCenter();
        const muzzleOffset = Utility.Angle.rotateForce(NetGun.muzzleOffset, this.getAngle());

        return new Vector(
            center.x + muzzleOffset.x * this.body.getDirectionMultiplier(),
            center.y + muzzleOffset.y
        );
    }

    public shoot(seed: number, local: boolean): OnItemUseEffect[] {
        if (this.ammo > 0) {
            this.ammo--;
            AudioManager.get().play(Sound.netGunFire);
            ProjectileManager.addProjectile(new Net(this.getMuzzlePos(), this.getAngle(), this.body.direction), local);
            return [{ type: OnItemUseType.Knockback, value: this.getKnockback() }];
        } else {
            AudioManager.get().play(Sound.click);
        }
        return [];
    }

    private getKnockback(): Vector {
        const result = Utility.Angle.rotateForce(new Vector(NetGun.knockback.x, 0), this.getAngle());
        result.x *= this.body.getDirectionMultiplier();
        if (this.getAngle() === 0) {
            result.y += NetGun.knockback.y;
        }
        return result;
    }

    public draw(): void {
        const baseSize = 64;
        const gaugeSize = 16;

        NetGun.baseSprite.draw(this.getDrawPos(baseSize), baseSize, this.body.isFlip(), this.getAngle(), this.getZIndex());
        NetGun.gaugeSprite.draw(this.getDrawPos(gaugeSize), gaugeSize, this.body.isFlip(), this.getAngle(), this.getZIndex(), NetGun.gaugeFrames[this.ammo]);
    }

    public getHandOffset(): Vector {
        return NetGun.handOffset;
    }

    public getHoldOffset(): Vector {
        return NetGun.holdOffset;
    }

    public shouldBeDeleted(): boolean {
        return super.shouldBeDeleted() || (this.deleteHelper() && this.ammo === 0);
    }
}

export { NetGun };