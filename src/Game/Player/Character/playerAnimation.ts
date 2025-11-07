import { Animation, images, SpriteAnimator, SpriteSheet, Utility, Vector } from "@common";
import { PlayerAnimType } from "./playerAnimType";

class playerAnimation {
    private bodyAnimator: SpriteAnimator;
    private armAnimator: SpriteAnimator;
    private animations: Record<PlayerAnimType, Animation> = {
        [PlayerAnimType.idle]: new Animation(),
        [PlayerAnimType.walk]: new Animation(),
        [PlayerAnimType.crouch]: new Animation(),
        [PlayerAnimType.flap]: new Animation(),
        [PlayerAnimType.jump]: new Animation(),
        [PlayerAnimType.fall]: new Animation(),
        [PlayerAnimType.slide]: new Animation(),
        [PlayerAnimType.turn]: new Animation()
    };
    private itemHoldingAnimation = new Animation();
    private holding: boolean = false;

    constructor() {
        const bodySpriteInfo = Utility.File.getImage(images.playerImage);
        const bodySprite = new SpriteSheet(bodySpriteInfo.src, bodySpriteInfo.frameHeight, bodySpriteInfo.frameWidth);
        this.bodyAnimator = new SpriteAnimator(bodySprite, this.animations[PlayerAnimType.idle]);

        const armSpriteInfo = Utility.File.getImage(images.playerHands);
        const armSprite = new SpriteSheet(armSpriteInfo.src, armSpriteInfo.frameHeight, armSpriteInfo.frameWidth);
        this.armAnimator = new SpriteAnimator(armSprite, this.animations[PlayerAnimType.idle]);

        this.setUpAnimations();
    }

    public setAnimation(animation: PlayerAnimType) {
        const anim: Animation = this.animations[animation];
        this.bodyAnimator.setAnimation(anim);
        this.armAnimator.setAnimation(anim);
        if (this.holding) {
            this.armAnimator.setAnimation(this.itemHoldingAnimation);
        }
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
        this.animations[PlayerAnimType.idle].addFrame({ row: 0, col: 0 });
        this.animations[PlayerAnimType.walk].addRow(1, 6);
        this.animations[PlayerAnimType.walk].repeat = true;
        this.animations[PlayerAnimType.crouch].addFrame({ row: 2, col: 0 });
        this.animations[PlayerAnimType.flap].addRow(3, 4);
        this.animations[PlayerAnimType.flap].repeat = true;
        this.animations[PlayerAnimType.flap].fps = 16;
        this.animations[PlayerAnimType.jump].addFrame({ row: 4, col: 0 });
        this.animations[PlayerAnimType.fall].addFrame({ row: 5, col: 0 });
        this.animations[PlayerAnimType.slide].addFrame({ row: 6, col: 0 });
        this.animations[PlayerAnimType.turn].addFrame({ row: 7, col: 0 });
        this.itemHoldingAnimation.addFrame({ row: 8, col: 0 });
    }
}

export { playerAnimation };