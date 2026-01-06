import { Animation, images, SpriteAnimator, SpriteSheet, Utility, Vector, PlayerAnim } from "@common";

class PlayerAnimation {
    private currAnim: PlayerAnim;
    private bodyAnimator: SpriteAnimator;
    private armAnimator: SpriteAnimator;
    private animations: Record<PlayerAnim, Animation> = {
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

    constructor() {
        this.currAnim = PlayerAnim.Idle;

        const bodySpriteInfo = Utility.File.getImage(images.playerImage);
        const bodySprite = new SpriteSheet(bodySpriteInfo.src, bodySpriteInfo.frameHeight, bodySpriteInfo.frameWidth);
        this.bodyAnimator = new SpriteAnimator(bodySprite, this.animations[this.currAnim]);

        const armSpriteInfo = Utility.File.getImage(images.playerHands);
        const armSprite = new SpriteSheet(armSpriteInfo.src, armSpriteInfo.frameHeight, armSpriteInfo.frameWidth);
        this.armAnimator = new SpriteAnimator(armSprite, this.animations[this.currAnim]);

        Utility.File.setAnimations("player", this.animations);
    }

    public setAnimation(animation: PlayerAnim) {
        this.currAnim = animation;
        this.bodyAnimator.setAnimation(this.animations[this.currAnim]);
        if (this.holding) {
            this.armAnimator.setAnimation(this.animations[PlayerAnim.ItemHolding]);
        } else {
            this.armAnimator.setAnimation(this.animations[this.currAnim]);
        }
    }

    public getCurrentAnimation(): PlayerAnim {
        return this.currAnim;
    }

    public drawBody(pos: Vector, drawSize: number, flip: boolean): void {
        const angle = 0;
        this.bodyAnimator.draw(pos, drawSize, flip, angle);
    };

    public drawArm(pos: Vector, drawSize: number, angle: number, flip: boolean): void {
        this.armAnimator.draw(pos, drawSize, flip, angle);
    }

    public drawRagdoll(headPos: Vector, legsPos: Vector, drawSize: number, headAngle: number, legsAngle: number, flip: boolean) {
        this.bodyAnimator.setAnimation(this.animations.upperRagdoll);
        this.bodyAnimator.draw(headPos, drawSize, flip, headAngle);
        this.bodyAnimator.setAnimation(this.animations.lowerRagdoll);
        this.bodyAnimator.draw(legsPos, drawSize, flip, legsAngle);
    
    }

    public update(deltaTime: number, holding: boolean): void {
        this.bodyAnimator.update(deltaTime);
        this.armAnimator.update(deltaTime);
        this.holding = holding;
    }
}

export { PlayerAnimation };