import { SpriteSheet, images, Vector, Utility, Frame } from "@common";
import { ITrail } from "@projectile";

class BulletTrail implements ITrail {
    private spriteSheet: SpriteSheet;
    private startingLocation: Vector;
    private target!: Vector;
    private maxLength: number;
    private size: number;
    private speed: Vector;
    private removing: boolean = false;
    private setToRemove: boolean = false;
    private frames = { default: new Frame() };

    constructor(startingLocation: Vector, speed: Vector, length: number, size: number) {
        const spriteInfo = Utility.File.getImage(images.trail);
        this.spriteSheet = new SpriteSheet(spriteInfo.src, spriteInfo.frameWidth, spriteInfo.frameHeight);
        this.startingLocation = startingLocation;
        this.maxLength = length;
        this.size = size;
        this.speed = speed;
        Utility.File.setFrames("trail", this.frames);
    }

    public update(deltaTime: number) {
        if (this.removing) {
            this.removeUpdate(deltaTime);
        }
    }

    private removeUpdate(deltaTime: number) {
        const nextX = this.startingLocation.x + this.speed.x * deltaTime * 60;
        const nextY = this.startingLocation.y + this.speed.y * deltaTime * 60;
        const goingRight = this.speed.x > 0;
        const goingDown = this.speed.y > 0;
        const passedTargetX = goingRight ? nextX > this.target.x : nextX < this.target.x;
        const passedTargetY = goingDown ? nextY > this.target.y : nextY < this.target.y;
        if (passedTargetX || passedTargetY) {
            this.setToRemove = true;
        } else {
            this.startingLocation = new Vector(nextX, nextY);
        }
    }

    public setTarget(target: Vector): void {
        const DX = target.x - this.startingLocation.x;
        const DY = target.y - this.startingLocation.y;
        const length = Math.hypot(DX, DY);

        if (length > this.maxLength) {
            const ratio = this.maxLength / length;
            this.startingLocation = new Vector(
                target.x - DX * ratio,
                target.y - DY * ratio,
            );
        }
        this.target = target;
    }

    public setToDelete(): void {
        this.removing = true;
    }

    public shouldBeDeleted(): boolean {
        return this.setToRemove;
    }

    public draw(): void {
        this.spriteSheet.drawLine(this.frames.default, this.startingLocation, this.target, this.size);
    }
}

export { BulletTrail };