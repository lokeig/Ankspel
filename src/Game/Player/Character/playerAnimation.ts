import { Animation, SpriteAnimator, SpriteSheet, Utility, PlayerAnim, EquipmentSlot } from "@common";
import { PlayerEquipment } from "./playerEquipment";
import { Vector } from "@math";
import { ImageInfo, ImageName, Images } from "@render";

class PlayerAnimation {
    private currAnim: PlayerAnim;
    private bodyAnimator: SpriteAnimator;
    private armAnimator: SpriteAnimator;
    private static animations: Record<PlayerAnim, Animation> = {
        [PlayerAnim.Idle]: new Animation(),
        [PlayerAnim.Walk]: new Animation(),
        [PlayerAnim.Crouch]: new Animation(),
        [PlayerAnim.Flap]: new Animation(),
        [PlayerAnim.Jump]: new Animation(),
        [PlayerAnim.Fall]: new Animation(),
        [PlayerAnim.Slide]: new Animation(),
        [PlayerAnim.Turn]: new Animation(),
        [PlayerAnim.ItemHolding]: new Animation(),
        [PlayerAnim.UpperRagdoll]: new Animation(),
        [PlayerAnim.LowerRagdoll]: new Animation()
    };
    private holding: boolean = false;

    private bodySprite: SpriteSheet;
    private armSprite: SpriteSheet;


    static {
        Utility.File.setAnimations("player", this.animations);
    }

    constructor(color: ImageName) {
        this.currAnim = PlayerAnim.Idle;

        const handsImage = color + "Hands" as ImageName;

        this.bodySprite = new SpriteSheet(Images[color]);
        this.armSprite = new SpriteSheet(Images[handsImage]);

        this.bodyAnimator = new SpriteAnimator(this.bodySprite, PlayerAnimation.animations[this.currAnim]);
        this.armAnimator = new SpriteAnimator(this.armSprite, PlayerAnimation.animations[this.currAnim]);
    }

    public setAnimation(animation: PlayerAnim) {
        this.currAnim = animation;
        this.bodyAnimator.setAnimation(PlayerAnimation.animations[this.currAnim]);
        if (this.holding) {
            this.armAnimator.setAnimation(PlayerAnimation.animations[PlayerAnim.ItemHolding]);
        } else {
            this.armAnimator.setAnimation(PlayerAnimation.animations[this.currAnim]);
        }
    }

    public reset(): void {
        this.holding = false;
        this.setAnimation(PlayerAnim.Idle);
    }

    public getCurrentAnimation(): PlayerAnim {
        return this.currAnim;
    }

    public drawItems(equipment: PlayerEquipment): void {
        const draw = (slot: EquipmentSlot): void => {
            if (equipment.hasItem(slot)) {
                equipment.getItem(slot).draw();
            }
        }
        draw(EquipmentSlot.Head);
        draw(EquipmentSlot.Body);
        draw(EquipmentSlot.Boots);
        draw(EquipmentSlot.Hand);
    }

    public drawBody(pos: Vector, drawSize: number, flip: boolean, angle: number = 0): void {
        this.bodyAnimator.draw(pos, drawSize, flip, angle);
    };

    public drawArm(pos: Vector, drawSize: number, angle: number, flip: boolean): void {
        this.armAnimator.draw(pos, drawSize, flip, angle);
    }

    public drawRagdoll(headPos: Vector, legsPos: Vector, drawSize: number, headAngle: number, legsAngle: number, flip: boolean) {
        this.bodyAnimator.setAnimation(PlayerAnimation.animations[PlayerAnim.UpperRagdoll]);
        this.bodyAnimator.draw(headPos, drawSize, flip, headAngle);

        this.bodyAnimator.setAnimation(PlayerAnimation.animations[PlayerAnim.LowerRagdoll]);
        this.bodyAnimator.draw(legsPos, drawSize, flip, legsAngle);
    }

    public update(deltaTime: number, holding: boolean): void {
        this.bodyAnimator.update(deltaTime);
        this.armAnimator.update(deltaTime);
        this.holding = holding;
    }
}

export { PlayerAnimation };