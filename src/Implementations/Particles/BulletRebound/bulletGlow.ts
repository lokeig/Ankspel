import { AxisDirection, Countdown, Frame, images, SpriteSheet, Utility, Vector } from "@common";

class GlowingBullet {
    private lifeTime = new Countdown(10);

    private spriteSheet: SpriteSheet;
    private pos: Vector;
    private angle: number;
    private static readonly drawSize: number = 32;

    private frames = {
        default: new Frame()
    }

    constructor(pos: Vector, angle: number) {
        this.pos = pos;
        this.angle = angle;

        const imageSrc = Utility.File.getImage(images.bulletRebound);
        this.spriteSheet = new SpriteSheet(imageSrc.src, imageSrc.frameWidth, imageSrc.frameHeight);
        Utility.File.setFrames("bulletGlow", this.frames);
    }

    public draw(): void {
        const flip = false;
        this.spriteSheet.draw(this.frames.default, this.pos, TileMarker.drawSize, flip, this.angle);
    }

    public update(deltaTime: number) {
        this.lifeTime.update(deltaTime);
    }

    public shouldBeDeleted(): boolean {
        return this.lifeTime.isDone();
    }
}

export { TileMarker };