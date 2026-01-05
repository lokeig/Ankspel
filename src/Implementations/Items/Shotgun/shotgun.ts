import { Lerp, lerpTriangle, SpriteSheet, images, Vector, Utility, Frame, ItemInteractionInput } from "@common";
import { ShotgunState } from "./shotgunState";
import { FirearmInfo } from "../firearmInfo";
import { Item } from "../item";
import { OnItemUseEffect } from "@item";

class Shotgun extends Item {
    private handleOffset: number = 0;
    private maxHandleOffset: number = -8;
    private handleLerp = new Lerp(6, lerpTriangle)

    private frames = {
        gun: new Frame(),
        handle: new Frame()
    }

    private currentState: ShotgunState = ShotgunState.Loaded;
    private spriteSheet: SpriteSheet;
    private firearmInfo!: FirearmInfo;

    constructor(pos: Vector) {
        const width = 30;
        const height = 15;
        super(pos, width, height);

        this.holdOffset = new Vector(14, -4);
        this.handOffset = new Vector(4, 0);

        const spriteInfo = Utility.File.getImage(images.shotgun);
        this.spriteSheet = new SpriteSheet(spriteInfo.src, spriteInfo.frameWidth, spriteInfo.frameHeight);
        Utility.File.setFrames("shotgun", this.frames);
        this.setupFirearmInfo();

        this.interactions.on(ItemInteractionInput.Activate, ((seed: number) => {
            return this.shoot(seed);
        }));
    }

    private setupFirearmInfo(): void {
        this.firearmInfo = new FirearmInfo();
        this.firearmInfo.projectile = "shotgunBullet";
        this.firearmInfo.ammo = 2;
        this.firearmInfo.bulletCount = 10;
        this.firearmInfo.bulletAngleVariation = Math.PI / 12;
        this.firearmInfo.pipeOffset = new Vector(28, -10);
        this.firearmInfo.knockback = new Vector(720, 240);
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);
        if (this.handleLerp.isActive()) {
            this.handleOffset = this.handleLerp.update(deltaTime);
        }
    }

    private shoot(seed: number): OnItemUseEffect[] {
        if (this.currentState === ShotgunState.Loaded) {
            return this.fire(seed);
        } else if (this.currentState === ShotgunState.Reloadable) {
            return this.reload();
        } else {
            return [];
        }
    }

    private fire(seed: number): OnItemUseEffect[] {
        this.handleLerp.cancel();
        this.handleOffset = 0;
        this.currentState = ShotgunState.Reloadable;
        return this.firearmInfo.shoot(this.body.getCenter(), this.localAngle, this.body.isFlip(), seed);
    }

    private reload(): OnItemUseEffect[] {
        this.handleLerp.startLerp(0, this.maxHandleOffset);
        this.currentState = this.firearmInfo.ammo === 0 ? ShotgunState.Empty : ShotgunState.Loaded;
        return [];
    }

    public draw(): void {
        const drawSize = 64;
        const drawPos = this.getDrawPos(drawSize);
        this.spriteSheet.draw(this.frames.gun, drawPos, drawSize, this.body.isFlip(), this.angle());

        const handleOffsetRotated = Utility.Angle.rotateForce(new Vector(this.handleOffset, 0), this.angle());
        const handleDrawPos = new Vector(
            drawPos.x + handleOffsetRotated.x * this.body.getDirectionMultiplier(),
            drawPos.y + handleOffsetRotated.y
        )
        this.spriteSheet.draw(this.frames.handle, handleDrawPos, drawSize, this.body.isFlip(), this.angle());
    }

    public shouldBeDeleted(): boolean {
        return super.shouldBeDeleted() || (this.deleteHelper() && this.currentState === ShotgunState.Empty);
    }

}

export { Shotgun };