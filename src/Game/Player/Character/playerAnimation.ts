import { Animation, SpriteAnimator, SpriteSheet, PlayerAnim, EquipmentSlot } from "@common";
import { PlayerEquipment } from "./playerEquipment";
import { Vector } from "@math";
import { Images, zIndex } from "@render";

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
        [PlayerAnim.UpperRagdoll]: new Animation(),
        [PlayerAnim.LowerRagdoll]: new Animation(),
        [PlayerAnim.Netted]: new Animation(),
        [PlayerAnim.ItemHolding]: new Animation(),
    };
    private holding: boolean = false;
    private quacking: boolean = false;

    private bodyBaseSprite: SpriteSheet;
    private bodyBaseQuackSprite: SpriteSheet;
    private bodyColorSprite: SpriteSheet;
    private bodyMultiplySprite: SpriteSheet;
    private bodyOverlaySprite: SpriteSheet;

    private handBaseSprite: SpriteSheet;
    private handColorSprite: SpriteSheet;
    private handMultiplySprite: SpriteSheet;
    private handOverlaySprite: SpriteSheet;

    static {
        this.animations.walk.addRow(1, 6);
        this.animations.walk.repeat = true;

        this.animations.flap.addRow(3, 4);
        this.animations.flap.repeat = true;
        this.animations.flap.fps = 24;

        this.animations.idle.addFrame(0, 0);
        this.animations.crouch.addFrame(2, 0);
        this.animations.jump.addFrame(4, 0);
        this.animations.fall.addFrame(5, 0);
        this.animations.slide.addFrame(6, 0);
        this.animations.turn.addFrame(7, 0);
        this.animations.upperRagdoll.addFrame(8, 0);
        this.animations.lowerRagdoll.addFrame(9, 0);
        this.animations.itemHolding.addFrame(8, 0)
        this.animations.netted.addFrame(0, 1);
    }

    constructor(color: string) {
        this.currAnim = PlayerAnim.Idle;

        this.bodyBaseSprite = new SpriteSheet(Images.playerBase);
        this.bodyBaseQuackSprite = new SpriteSheet(Images.playerBaseQuack);
        this.handBaseSprite = new SpriteSheet(Images.playerHandsBase);

        this.bodyMultiplySprite = new SpriteSheet(Images.playerBaseMultiply);
        this.bodyMultiplySprite.setBlendingMode("multiply");
        this.handMultiplySprite = new SpriteSheet(Images.playerHandsBaseMultiply);
        this.handMultiplySprite.setBlendingMode("multiply");

        this.bodyOverlaySprite = new SpriteSheet(Images.playerOverlay);
        this.bodyOverlaySprite.setBlendingMode("overlay");
        this.handOverlaySprite = new SpriteSheet(Images.playerHandsOverlay);
        this.handOverlaySprite.setBlendingMode("overlay");

        this.bodyColorSprite = new SpriteSheet(Images.playerMask);
        this.bodyColorSprite.setColor(color);
        this.handColorSprite = new SpriteSheet(Images.playerHandsMask);
        this.handColorSprite.setColor(color);

        this.bodyAnimator = new SpriteAnimator(this.bodyBaseSprite, PlayerAnimation.animations[this.currAnim]);
        this.armAnimator = new SpriteAnimator(this.handBaseSprite, PlayerAnimation.animations[this.currAnim]);
    }

    public setAnimation(animation: PlayerAnim) {
        this.currAnim = animation;
        this.bodyAnimator.setAnimation(PlayerAnimation.animations[this.currAnim]);
        if (this.holding) {
            this.armAnimator.setAnimation(PlayerAnimation.animations[PlayerAnim.ItemHolding]);
        } else {
            this.armAnimator.setAnimation(PlayerAnimation.animations[this.currAnim]);
            this.armAnimator.syncTimer(this.bodyAnimator);
        }
    }

    public reset(): void {
        this.holding = false;
        this.setAnimation(PlayerAnim.Idle);
    }

    public getCurrentAnimation(): PlayerAnim {
        return this.currAnim;
    }

    private drawItem(equipment: PlayerEquipment, slot: EquipmentSlot, offset: Vector = new Vector()) {
        if (equipment.hasItem(slot)) {
            const item = equipment.getItem(slot);

            offset.x *= item.body.getDirectionMultiplier();
            const pos = item.body.pos;
            pos.add(offset);

            item.draw();
            pos.subtract(offset);
        }
    }

    private drawItemTopLayer(equipment: PlayerEquipment, slot: EquipmentSlot, offset: Vector = new Vector()) {
        if (equipment.hasItem(slot)) {
            const item = equipment.getItem(slot);
            if (!item.drawTopLayer) {
                return;
            }
            offset.x *= item.body.getDirectionMultiplier();
            const pos = item.body.pos;
            pos.add(offset);

            item.drawTopLayer();
            pos.subtract(offset);
        }
    }

    public drawEquipment(equipment: PlayerEquipment): void {
        this.drawItem(equipment, EquipmentSlot.Head, this.getHeadOffset());
        this.drawItem(equipment, EquipmentSlot.Body, this.getChestOffset());
        this.drawItem(equipment, EquipmentSlot.Boots);
    }

    public drawHolding(equipment: PlayerEquipment): void {
        this.drawItem(equipment, EquipmentSlot.Hand);
    }

    public drawTopLayers(equipment: PlayerEquipment): void {
        this.drawItemTopLayer(equipment, EquipmentSlot.Head, this.getHeadOffset());
        this.drawItemTopLayer(equipment, EquipmentSlot.Body, this.getChestOffset());
        this.drawItemTopLayer(equipment, EquipmentSlot.Boots);
        this.drawItemTopLayer(equipment, EquipmentSlot.Hand);
    }

    public drawBody(pos: Vector, drawSize: number, flip: boolean, angle: number = 0, z: number = zIndex.Player): void {
        const drawLayer = (sprite: SpriteSheet) => {
            this.bodyAnimator.setSheet(sprite);
            this.bodyAnimator.draw(pos, drawSize, flip, angle, z);
        };
        !this.quacking ? drawLayer(this.bodyBaseSprite) : drawLayer(this.bodyBaseQuackSprite);
        drawLayer(this.bodyColorSprite);
        drawLayer(this.bodyMultiplySprite);
        drawLayer(this.bodyOverlaySprite);
    };

    public drawArm(pos: Vector, drawSize: number, angle: number, flip: boolean, z: number = zIndex.Player): void {
        const drawLayer = (sprite: SpriteSheet) => {
            this.armAnimator.setSheet(sprite);
            this.armAnimator.draw(pos, drawSize, flip, angle, z);
        };
        drawLayer(this.handBaseSprite);
        drawLayer(this.handColorSprite);
        drawLayer(this.handMultiplySprite);
        drawLayer(this.handOverlaySprite);
    }

    private getHeadOffset(): Vector {
        let result = new Vector();
        switch (this.getCurrentAnimation()) {
            case (PlayerAnim.Jump): result.set(0, -3); break;
            case (PlayerAnim.Fall): result.set(-2, 2); break;
            case (PlayerAnim.Turn): result.set(-2, -2); break;
            case (PlayerAnim.Walk): this.setWalkAnimationHelmet(result); break;
        }

        return result;
    }

    private setWalkAnimationHelmet(vector: Vector): void {
        switch (this.bodyAnimator.getCurrentFrame()) {
            case (0): vector.set(0, -4); break;
            case (1): vector.set(0, -2); break;
            case (2): vector.set(0, -0); break;
            case (3): vector.set(0, -4); break;
            case (4): vector.set(0, -2); break;
            case (5): vector.set(2, 0); break;
        }
    }

    private getChestOffset(): Vector {
        let result = new Vector();
        switch (this.getCurrentAnimation()) {
            case (PlayerAnim.Jump): result.set(0, -3); break;
            case (PlayerAnim.Fall): result.set(-2, 0); break;
            case (PlayerAnim.Turn): result.set(-2, -2); break;
            case (PlayerAnim.Walk): this.setWalkAnimationChest(result); break;
        }

        return result;
    }

    private setWalkAnimationChest(vector: Vector): void {
        switch (this.bodyAnimator.getCurrentFrame()) {
            case (0): vector.set(2, -4); break;
            case (1): vector.set(0, -2); break;
            case (2): vector.set(0, -0); break;
            case (3): vector.set(0, -4); break;
            case (4): vector.set(2, -2); break;
            case (5): vector.set(4, 0); break;
        }
    }

    public update(deltaTime: number, holding: boolean, quacking: boolean): void {
        this.bodyAnimator.update(deltaTime);
        this.armAnimator.update(deltaTime);
        this.holding = holding;
        this.quacking = quacking;
    }
}

export { PlayerAnimation };