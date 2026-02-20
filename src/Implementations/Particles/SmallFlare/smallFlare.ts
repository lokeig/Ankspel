import { Vector } from "@math";
import { Countdown, Frame, images, SpriteSheet, Utility } from "@common";

class SmallFlare {
    private lifeTime = new Countdown(0.1);

    private static readonly drawSize: number = 16;
    private static spriteSheet: SpriteSheet;

    static {
        const imageSrc = Utility.File.getImage(images.smallFlare);
        this.spriteSheet = new SpriteSheet(imageSrc.src, imageSrc.frameWidth, imageSrc.frameHeight);
    }

    constructor() {
        this.lifeTime.setToReady();
    }

    public update(deltaTime: number) {
        this.lifeTime.update(deltaTime);
    }

    public reset(): void {
        this.lifeTime.reset();
    }

    public draw(pos: Vector, flip: boolean, angle: number): void {
        const center = pos.subtract(SmallFlare.drawSize / 2);
        SmallFlare.spriteSheet.draw(center, SmallFlare.drawSize, flip, angle);
    }

    public shouldBeShown(): boolean {
        return !this.lifeTime.isDone();
    }

    public shouldBeDeleted(): boolean {
        return this.lifeTime.isDone();
    }
}

export { SmallFlare };