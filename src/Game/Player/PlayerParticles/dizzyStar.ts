import { Vector } from "@math";
import { Countdown, SpriteSheet } from "@common";
import { Images, zIndex } from "@render";
import { IParticle } from "@game/Particles";

class DizzyStars implements IParticle {
    private static spriteSheet: SpriteSheet;
    private static drawDimensions = new Vector(Images.dizzyStar.frameWidth, Images.dizzyStar.frameHeight).multiply(2);

    private pos: Vector;
    private lifeTime = new Countdown(0.5);

    static {
        this.spriteSheet = new SpriteSheet(Images.dizzyStar);
    }

    constructor(pos: Vector) {
        this.pos = pos;
    }

    public update(deltaTime: number) {
        this.lifeTime.update(deltaTime);
    }

    public draw(): void {
        const percent = this.lifeTime.getPercentageReady();
        const scale = 1 - percent;
        const size = DizzyStars.drawDimensions.clone().multiply(scale);

        const center = this.pos.clone().subtract(size.clone().divide(2));
        const triangleOffset = 15;
        const topLeft = new Vector(center.x - triangleOffset, center.y - triangleOffset);
        const topRight = new Vector(center.x + triangleOffset, center.y - triangleOffset);

        const movingOffsetX = 40 * percent;
        const movingOffsetY = Math.sin(percent * Math.PI) * 10;
        const left = new Vector(center.x - movingOffsetX, center.y - movingOffsetY);
        const right = new Vector(center.x + movingOffsetX, center.y - movingOffsetY);

        [center, topLeft, topRight, left, right].forEach(star => {
            DizzyStars.spriteSheet.draw(star, size, false, 0, zIndex.Particles);
        });
    }


    public shouldBeDeleted(): boolean {
        return this.lifeTime.isDone();
    }
}

export { DizzyStars };