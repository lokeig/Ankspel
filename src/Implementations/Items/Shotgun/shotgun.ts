import { Vector } from "@math";
import { Lerp, lerpTriangle, SpriteSheet, Utility, Frame, ItemInteraction } from "@common";
import { ShotgunState } from "./shotgunState";
import { FirearmHelper } from "../firearmHelper";
import { Item } from "../item";
import { OnItemUseEffect } from "@item";
import { Images, zIndex } from "@render";
import { AudioManager } from "@game/Audio/audioManager";
import { Sound } from "@game/Audio";

class Shotgun extends Item {
    private static maxHandleOffset: number = -8;
    private static frames = { gun: new Frame(), handle: new Frame() }
    private static spriteSheet: SpriteSheet;
    private static holdOffset = new Vector(14, -4);
    private static handOffset = new Vector(4, 0);

    private handleOffset: number = 0;
    private handleLerp = new Lerp(6, lerpTriangle)
    private firearmInfo!: FirearmHelper;
    private currentState: ShotgunState = ShotgunState.Loaded;

    static {
        this.spriteSheet = new SpriteSheet(Images.shotgun);

        this.frames.gun.set(0, 0);
        this.frames.handle.set(1, 0);
    }

    constructor(pos: Vector, id: number) {
        const width = 30;
        const height = 15;
        super(pos, width, height, id);

        this.info.holdOffset = Shotgun.holdOffset;
        this.info.handOffset = Shotgun.handOffset;

        this.playerInteractions.setUse(ItemInteraction.Activate, ((seed: number, local: boolean) => {
            return this.shoot(seed, local);
        }));
        this.setupFirearmInfo();
    }

    private setupFirearmInfo(): void {
        this.firearmInfo = new FirearmHelper();
        this.firearmInfo.ammo = 2;
        this.firearmInfo.bulletCount = 6;
        this.firearmInfo.bulletAngleVariation = Math.PI / 30;
        this.firearmInfo.muzzleOffset = new Vector(28, -10);
        this.firearmInfo.knockback = new Vector(920, 240);
        this.firearmInfo.bulletRange = 8;
        this.firearmInfo.bulletRangeVariation = 1;
        this.firearmInfo.bulletSpeed = 4800;
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);
        if (this.handleLerp.isActive()) {
            this.handleOffset = this.handleLerp.update(deltaTime);
        }
    }

    private shoot(seed: number, local: boolean): OnItemUseEffect[] {
        if (this.currentState === ShotgunState.Loaded) {
            return this.fire(seed, local);
        } else if (this.currentState === ShotgunState.Reloadable) {
            return this.reload();
        } else {
            AudioManager.get().play(Sound.click);
            return [];
        }
    }

    private fire(seed: number, local: boolean): OnItemUseEffect[] {
        this.handleLerp.cancel();
        this.handleOffset = 0;
        this.currentState = ShotgunState.Reloadable;
        AudioManager.get().play(Sound.shotgunFire);
        return this.firearmInfo.shoot(this.body.getCenter(), this.getAngle(), this.body.isFlip(), seed, local);
    }

    private reload(): OnItemUseEffect[] {
        this.handleLerp.startLerp(0, Shotgun.maxHandleOffset);
        this.currentState = this.firearmInfo.ammo === 0 ? ShotgunState.Empty : ShotgunState.Loaded;
        AudioManager.get().play(Sound.shotgunLoad);
        return [];
    }

    public getHandOffset(): Vector {
        return Shotgun.handOffset;
    }

    public getHoldOffset(): Vector {
        return Shotgun.holdOffset;
    }

    public draw(): void {
        const drawSize = 64;
        const drawPos = this.getDrawPos(drawSize);
        Shotgun.spriteSheet.draw(drawPos, drawSize, this.body.isFlip(), this.getAngle(), this.getZIndex(), Shotgun.frames.gun);

        const handleOffsetRotated = Utility.Angle.rotateForce(new Vector(this.handleOffset, 0), this.getAngle());
        const handleDrawPos = new Vector(
            drawPos.x + handleOffsetRotated.x * this.body.getDirectionMultiplier(),
            drawPos.y + handleOffsetRotated.y
        )
        Shotgun.spriteSheet.draw(handleDrawPos, drawSize, this.body.isFlip(), this.getAngle(), this.getZIndex(), Shotgun.frames.handle);
    }

    public shouldBeDeleted(): boolean {
        return super.shouldBeDeleted() || (this.deleteHelper() && this.currentState === ShotgunState.Empty);
    }
}

export { Shotgun };