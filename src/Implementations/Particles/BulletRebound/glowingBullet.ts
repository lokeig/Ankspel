import { Vector } from "@math";
import { Countdown, SpriteSheet, Utility } from "@common";
import { Images } from "@render";

class GlowingBullet {
    private static spriteSheet: SpriteSheet;
    
    private lifeTime = new Countdown(0.2);
    private pos: Vector;
    private angle: number;
    private target: Vector;

    private readonly height: number = Utility.Random.getInRange(2, 8);
    private static readonly width: number = 2;

    private velocity = new Vector(Utility.Random.getInRange(50, 500), 0);
    private rotateSpeed: number = Utility.Random.getInRange(-1, 1);

    static {
        this.spriteSheet = new SpriteSheet(Images.bulletGlow);
    }

    constructor(pos: Vector, angle: number) {
        this.pos = pos.clone();
        this.angle = Math.PI + angle + Utility.Random.getInRange(-Math.PI / 3, Math.PI / 3);
        this.target = this.calculateTarget();
    }

    private calculateTarget(): Vector {
        const offset = Utility.Angle.rotateForce(new Vector(this.height, 0), this.angle);
        return this.pos.clone().add(offset);
    }
    
    public update(deltaTime: number) {
        this.lifeTime.update(deltaTime);

        const angledVelocity = Utility.Angle.rotateForce(this.velocity, this.angle);

        this.pos.add(angledVelocity.multiply(deltaTime));
        this.angle += this.rotateSpeed * deltaTime;
        this.target = this.calculateTarget();
    }

    public draw(): void {
        const opacity = 1 - this.lifeTime.getPercentageReady();
        GlowingBullet.spriteSheet.drawLine(this.pos, this.target, GlowingBullet.width, undefined, opacity);
    }


    public shouldBeDeleted(): boolean {
        return this.lifeTime.isDone();
    }
}

export { GlowingBullet };