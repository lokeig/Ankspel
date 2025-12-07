import { Vector, SpriteAnimator, SpriteSheet, images, Animation, Utility } from "@common";


class ExplosionParticle {
    private pos: Vector;
    private scale: number;
    private angle: number = 0;
    private drawSize: number = 128;

    private animator: SpriteAnimator;
    private animation = new Animation;
    public setToDelete: boolean = false;

    constructor(pos: Vector, rotation: number, scale: number) {
        this.pos = pos;
        this.scale = scale;
        this.angle = rotation;

        const spriteInfo = Utility.File.getImage(images.explosion);
        this.animator = new SpriteAnimator(new SpriteSheet(spriteInfo.src, spriteInfo.frameWidth, spriteInfo.frameHeight), this.animation);
        this.animation.fps = 24;
        const framesWide = 4;
        this.animation.addSegment(0, 10, framesWide);
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

    private getDrawPos(): Vector {
        return this.pos.clone().subtract(this.drawSize / 2);
    }

    public draw(): void {
        const flip = false;
        this.animator.draw(this.getDrawPos(), this.drawSize * this.scale, flip, this.angle);
    }
}

export { ExplosionParticle };