import { Vector } from "@math";
import { Animation, Countdown, SpriteAnimator, SpriteSheet, Utility } from "@common";
import { Images, zIndex } from "@render";
import { DynamicObject } from "@core";

class Feather {
    private static animation = new Animation();
    private static drawSize = new Vector(Images.playerFeather.frameWidth, Images.playerFeather.frameHeight).multiply(2);

    static {
        this.animation.addRow(0, 4);
        this.animation.repeat = true;
        this.animation.fps = 10;
    }

    private body: DynamicObject;
    private colorSprite = new SpriteSheet(Images.playerFeather);
    private overlaySprite = new SpriteSheet(Images.playerFeather);

    private animator = new SpriteAnimator(this.colorSprite, Feather.animation);
    private swayNumber = Math.random();

    constructor(pos: Vector, color: string) {
        this.colorSprite.setColor(color);

        const width = 12;
        const height = 8;
        pos.x -= width / 2;
        pos.y -= height / 2;
        this.body = new DynamicObject(pos, width, height);

        const xRange = 500;
        this.body.velocity.x = Utility.Random.getInRange(-xRange, xRange);
        this.body.velocity.y = Utility.Random.getInRange(-150, 20);

        this.body.gravity = 190;
        this.body.ignoreFriction = true;
    }

    public update(deltaTime: number) {
        this.body.update(deltaTime)
        if (this.body.grounded) {
            this.body.ignoreFriction = false;
            return;
        }
        this.swayNumber += deltaTime;
        const swayingDistance = 100;
        const swayingFrequency = 1.5;
        this.body.velocity.x = Math.cos(this.swayNumber * swayingFrequency) * swayingDistance;
        this.animator.update(deltaTime);

    }

    public draw(): void {
        this.animator.setSheet(this.colorSprite);
        this.animator.draw(this.body.pos, Feather.drawSize, false, 0, zIndex.Particles);
        this.overlaySprite.setBlendingMode("multiply");
        this.animator.setSheet(this.overlaySprite);
        this.animator.draw(this.body.pos, Feather.drawSize, false, 0, zIndex.Particles);
        this.overlaySprite.setBlendingMode("overlay");
        this.animator.setSheet(this.overlaySprite);
        this.animator.draw(this.body.pos, Feather.drawSize, false, 0, zIndex.Particles);
    }

    public shouldBeDeleted(): boolean {
        return false;
    }
}

export { Feather };