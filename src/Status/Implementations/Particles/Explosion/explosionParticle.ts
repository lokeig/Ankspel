import { images } from "../../../Game/Common/images";
import { Animation } from "../../../Game/Common/Sprite/Animation/animation";
import { SpriteSheet } from "../../../Game/Common/Sprite/sprite";
import { SpriteAnimator } from "../../../Game/Common/Sprite/spriteAnimator";
import { Vector } from "../../../Game/Common/Types/vector";

export class ExplosionParticle {
    private pos: Vector;
    private scale: number;
    private angle: number = 0;
    private drawSize: number = 128;
    
    private spriteAnimator: SpriteAnimator;
    private animation = new Animation;
    public setToDelete: boolean = false;

    constructor(pos: Vector, rotation: number, scale: number) {
        this.pos = pos;
        this.scale = scale;
        this.angle = rotation;

        const spriteSize = 64;
        const sprite = new SpriteSheet(images.explosion, spriteSize, spriteSize);
        this.spriteAnimator = new SpriteAnimator(sprite, this.animation);
        this.animation.fps = 24;
        const framesWide = 4;
        this.animation.addSegment(0, 10, framesWide);
    }

    
    public update(deltaTime: number): void {
        const upwardsSpeed = 5;
        this.pos.y -= upwardsSpeed * deltaTime; 
        this.angle += 0.1 * deltaTime;

        this.spriteAnimator.update(deltaTime);
        if (this.spriteAnimator.animationDone()) {
            this.setToDelete = true;
        }
    }

    private getDrawPos(): Vector {
        return {
            x: this.pos.x - (this.drawSize / 2),
            y: this.pos.y - (this.drawSize / 2)
        };

    }
    
    public draw(): void {
        const flip = false;
        this.spriteAnimator.draw(this.getDrawPos(), this.drawSize * this.scale, flip, this.angle);
    }
}