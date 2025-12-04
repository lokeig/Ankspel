import { Animation, images, SpriteAnimator, SpriteSheet, Utility, Vector, PlayerAnim } from "@common";

class playerAnimation {
    private currAnim: PlayerAnim;
    private bodyAnimator: SpriteAnimator;
    private armAnimator: SpriteAnimator;
    private animations: Record<PlayerAnim, Animation> = {
        [PlayerAnim.idle]: new Animation(),
        [PlayerAnim.walk]: new Animation(),
        [PlayerAnim.crouch]: new Animation(),
        [PlayerAnim.flap]: new Animation(),
        [PlayerAnim.jump]: new Animation(),
        [PlayerAnim.fall]: new Animation(),
        [PlayerAnim.slide]: new Animation(),
        [PlayerAnim.turn]: new Animation(),
        [PlayerAnim.itemHolding]: new Animation()

    };
    private holding: boolean = false;

    constructor() {
        this.currAnim = PlayerAnim.idle;

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
            this.armAnimator.setAnimation(this.animations[PlayerAnim.itemHolding]);
        } else {
            this.armAnimator.setAnimation(this.animations[this.currAnim]);
        }
    }

    public getCurrentAnimation(): PlayerAnim {
        return this.currAnim;
    }

    public drawBody(pos: Vector, drawSize: number, flip: boolean): void {
        console.log(this.currAnim);
        const angle = 0;
        this.bodyAnimator.draw(pos, drawSize, flip, angle);
    };

    public drawArm(pos: Vector, drawSize: number, angle: number, flip: boolean): void {
        this.armAnimator.draw(pos, drawSize, flip, angle);
    }

    public update(deltaTime: number, holding: boolean): void {
        this.bodyAnimator.update(deltaTime);
        this.armAnimator.update(deltaTime);
        this.holding = holding;
    }
}

export { playerAnimation };