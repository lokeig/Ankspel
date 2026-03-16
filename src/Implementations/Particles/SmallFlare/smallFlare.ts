import { Vector } from "@math";
import { Countdown, SpriteSheet } from "@common";
import { Images, zIndex } from "@render";

class SmallFlare {
    private lifeTime = new Countdown(0.1);

    private static readonly drawSize: number = 16;
    private static spriteSheet: SpriteSheet;

    static {
        this.spriteSheet = new SpriteSheet(Images.smallFlare);
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
        SmallFlare.spriteSheet.draw(center, SmallFlare.drawSize, flip, angle, zIndex.Particles);
    }

    public shouldBeShown(): boolean {
        return !this.lifeTime.isDone();
    }

    public shouldBeDeleted(): boolean {
        return this.lifeTime.isDone();
    }
}

export { SmallFlare };