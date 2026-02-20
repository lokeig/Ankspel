import { Vector } from "@math";
import { AxisDirection, Countdown, Frame, images, SpriteSheet, Utility } from "@common";

class TileMarker {
    private lifeTime = new Countdown(0.15);

    private pos: Vector;
    private angle: number;
    private instanceFrame: Frame;

    private static readonly drawSize: number = 32;
    private static spriteSheet: SpriteSheet;
    private static frames: Record<string, Frame> = {
        f1: new Frame(),
        f2: new Frame(),
        f3: new Frame(),
        f4: new Frame(),
    }

    static {
        Utility.File.setFrames("bulletRebound", TileMarker.frames);
        const imageSrc = Utility.File.getImage(images.bulletRebound);
        this.spriteSheet = new SpriteSheet(imageSrc.src, imageSrc.frameWidth, imageSrc.frameHeight);
    }

    constructor(pos: Vector, normal: AxisDirection) {
        switch (normal) {
            case AxisDirection.Up:
                this.angle = Math.PI / 2;
                break;
            case AxisDirection.Right:
                this.angle = Math.PI;
                break;
            case AxisDirection.Down:
                this.angle = 3 * Math.PI / 2;
                break;
            case AxisDirection.Left:
                this.angle = 0;
                break;
        }
        this.pos = pos.clone().subtract(TileMarker.drawSize / 2);
        const offset = new Vector(-TileMarker.drawSize / 2, 0);
        const angledOffset = Utility.Angle.rotateForce(offset, this.angle);
        this.pos.add(angledOffset);


        this.instanceFrame = TileMarker.getRandomFrame();
    }

    private static getRandomFrame(): Frame {
        return Array.from(Object.values(this.frames))[Math.floor(Utility.Random.getInRange(0, 4))];
    }

    public draw(): void {
        const flip = false;
        const opacity = 1 - this.lifeTime.getPercentageReady();
        TileMarker.spriteSheet.draw(this.pos, TileMarker.drawSize, flip, this.angle, this.instanceFrame, opacity);
    }

    public update(deltaTime: number) {
        this.lifeTime.update(deltaTime);
    }

    public shouldBeDeleted(): boolean {
        return this.lifeTime.isDone();
    }
}

export { TileMarker };