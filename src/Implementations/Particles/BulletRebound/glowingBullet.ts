import { Vector } from "@math";
import { Countdown, SpriteSheet, Utility } from "@common";
import { Images } from "@render";
import { DynamicObject } from "@core";

class GlowingBullet {
    private static spriteSheet: SpriteSheet;

    private lifeTime = new Countdown(Utility.Random.getInRange(0.2, 1.6));
    private body: DynamicObject;

    private readonly height: number = Utility.Random.getInRange(4, 12);
    private readonly width: number = 3;

    static {
        this.spriteSheet = new SpriteSheet(Images.bulletGlow);
    }

    constructor(pos: Vector, angle: number) {
        this.body = new DynamicObject(pos.clone(), 0, 0);

        const angleVariation = Math.PI / 6;
        const randomizedAngle = angle + Utility.Random.getInRange(-angleVariation, angleVariation);

        this.body.velocity = Utility.Angle.rotateForce(
            new Vector(Utility.Random.getInRange(150, 450), 0),
            randomizedAngle
        );
        this.body.gravity = 840;
        this.body.ignoreFriction = true;
        this.body.bounceFactor = 0.8;
    }

    public update(deltaTime: number) {
        this.lifeTime.update(deltaTime);
        this.body.update(deltaTime);
    }

    public draw(): void {
        const opacity = 1 - (this.lifeTime.getPercentageReady() * this.lifeTime.getPercentageReady());
        const angle = Math.atan2(this.body.velocity.y, this.body.velocity.x);
        const offset = Utility.Angle.rotateForce(new Vector(this.height, 0), angle);
        const target = this.body.pos.clone().add(offset);

        GlowingBullet.spriteSheet.drawLine(this.body.pos, target, this.width, undefined, opacity);
    }

    public shouldBeDeleted(): boolean {
        return this.lifeTime.isDone();
    }
}

export { GlowingBullet };