import { Vector } from "@math";
import { SpriteAnimator, SpriteSheet, Animation, Utility } from "@common";
import { Images, zIndex } from "@render";

class ExplosionParticle {
    private pos: Vector;
    private scale: number;
    private angle: number = 0;

    private animator: SpriteAnimator;
    public setToDelete: boolean = false;

    private static animation = new Animation();
    private static sprite: SpriteSheet;

    static {
        this.sprite = new SpriteSheet(Images.explosion);
        this.animation.addSegment(0, 10, 4);
        this.animation.fps = 32;
    }

    constructor(pos: Vector, rotation: number, scale: number) {
        this.pos = pos;
        this.scale = scale;
        this.angle = rotation;

        this.animator = new SpriteAnimator(ExplosionParticle.sprite, ExplosionParticle.animation);
    }


    public update(deltaTime: number): void {
        const upwardsSpeed = 5;
        this.pos.y -= upwardsSpeed * deltaTime;
        this.angle += 0.1 * deltaTime;

        this.animator.update(deltaTime);
        if (this.animator.animationDone()) {
            this.setToDelete = true;
        }
    }

    private getDrawPos(drawSize: number): Vector {
        return this.pos.clone().subtract(drawSize / 2);
    }

    public draw(): void {
        const flip = false;
        const drawSize = 128;
        this.animator.draw(this.getDrawPos(drawSize), drawSize * this.scale, flip, this.angle, zIndex.Particles);
    }
}

export { ExplosionParticle };