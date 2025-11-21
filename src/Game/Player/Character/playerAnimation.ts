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
        [PlayerAnim.turn]: new Animation()
    };
    private itemHoldingAnimation = new Animation();
    private holding: boolean = false;

    constructor() {
        const standardAnimation = PlayerAnim.idle;
        this.currAnim = standardAnimation;

        const bodySpriteInfo = Utility.File.getImage(images.playerImage);
        const bodySprite = new SpriteSheet(bodySpriteInfo.src, bodySpriteInfo.frameHeight, bodySpriteInfo.frameWidth);
        this.bodyAnimator = new SpriteAnimator(bodySprite, this.animations[standardAnimation]);

        const armSpriteInfo = Utility.File.getImage(images.playerHands);
        const armSprite = new SpriteSheet(armSpriteInfo.src, armSpriteInfo.frameHeight, armSpriteInfo.frameWidth);
        this.armAnimator = new SpriteAnimator(armSprite, this.animations[standardAnimation]);
        
        this.setUpAnimations();
    }

    public setAnimation(animation: PlayerAnim) {
        this.currAnim = animation;
        const anim: Animation = this.animations[animation];
        this.bodyAnimator.setAnimation(anim);
        this.armAnimator.setAnimation(anim);
        if (this.holding) {
            this.armAnimator.setAnimation(this.itemHoldingAnimation);
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

    public update(deltaTime: number, holding: boolean): void {
        this.bodyAnimator.update(deltaTime);
        this.armAnimator.update(deltaTime);
        this.holding = holding;
    }

    private setUpAnimations(): void {
        this.animations[PlayerAnim.idle].addFrame({ row: 0, col: 0 });
        this.animations[PlayerAnim.walk].addRow(1, 6);
        this.animations[PlayerAnim.walk].repeat = true;
        this.animations[PlayerAnim.crouch].addFrame({ row: 2, col: 0 });
        this.animations[PlayerAnim.flap].addRow(3, 4);
        this.animations[PlayerAnim.flap].repeat = true;
        this.animations[PlayerAnim.flap].fps = 16;
        this.animations[PlayerAnim.jump].addFrame({ row: 4, col: 0 });
        this.animations[PlayerAnim.fall].addFrame({ row: 5, col: 0 });
        this.animations[PlayerAnim.slide].addFrame({ row: 6, col: 0 });
        this.animations[PlayerAnim.turn].addFrame({ row: 7, col: 0 });
        this.itemHoldingAnimation.addFrame({ row: 8, col: 0 });
    }
}

export { playerAnimation };