import { Vector, SpriteAnimator, SpriteSheet, images, Animation, Utility } from "@common";

class ExplosionParticle {
    private pos: Vector;
    private scale: number;
    private angle: number = 0;

    private animator: SpriteAnimator;
    public setToDelete: boolean = false;

    private static animations: Record<string, Animation> = { animation: new Animation };
    private static sprite: SpriteSheet;

    static {
        const spriteInfo = Utility.File.getImage(images.explosion);
        this.sprite = new SpriteSheet(spriteInfo.src, spriteInfo.frameWidth, spriteInfo.frameHeight);
        Utility.File.setAnimations("explosive", this.animations);
    }

    constructor(pos: Vector, rotation: number, scale: number) {
        this.pos = pos;
        this.scale = scale;
        this.angle = rotation;

        this.animator = new SpriteAnimator(ExplosionParticle.sprite, ExplosionParticle.animations.animation);
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
        this.animator.draw(this.getDrawPos(drawSize), drawSize * this.scale, flip, this.angle);
    }
}

export { ExplosionParticle };