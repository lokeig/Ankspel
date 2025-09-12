import { Animation } from "../../../../Common/Sprite/Animation/animation";
import { images } from "../../../../Common/images";
import { SpriteSheet } from "../../../../Common/Sprite/sprite";
import { SpriteAnimator } from "../../../../Common/Sprite/spriteAnimator";
import { Vector } from "../../../../Common/Types/vector";


export class PlayerArm {

    private animator: SpriteAnimator;
    public drawSize: number = 32;
    public pos: Vector = { x: 0, y: 0 };
    public angle: number = 0;
    public posOffset: Vector = { x: 0, y: 0 };
    public hidden: boolean = false;
    public rotateSpeed: number = 25;

    public itemHoldingAnimation = new Animation();

    constructor(animation: Animation) {
        this.itemHoldingAnimation.addFrame({ row: 8, col: 0 });
        this.animator = new SpriteAnimator(new SpriteSheet(images.playerHands, 16, 16), animation);
    }
    
    public update(deltaTime: number) {
        this.animator.update(deltaTime);
    }
    
    public draw(flip: boolean) {
        if (this.hidden) {
            return;
        }        
        const drawPosX = this.pos.x; 
        const drawPosY = this.pos.y; 
        const pos = { x: drawPosX, y: drawPosY };
        this.animator.draw(pos, this.drawSize, flip, this.angle);
    }

    public getCenter(): Vector {
        return {
            x: this.pos.x + (this.drawSize / 2),
            y: this.pos.y + (this.drawSize / 2)
        };
    }

    public rotateArmUp(deltaTime: number): void {
        this.angle -= deltaTime * this.rotateSpeed;
        this.angle = Math.max(this.angle, -Math.PI / 2)
    }

    public rotateArmDown(deltaTime: number): void {
        this.angle += deltaTime * this.rotateSpeed;
        this.angle = Math.min(this.angle, 0);
    }

    public setAnimation(animation: Animation) {
        this.animator.setAnimation(animation);
    }
}