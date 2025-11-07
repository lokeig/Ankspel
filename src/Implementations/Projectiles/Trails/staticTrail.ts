import { SpriteSheet, images, Vector, Utility } from "@common";
import { TrailInterface } from "@projectile";

class StaticTrail implements TrailInterface {
    private spriteSheet: SpriteSheet;
    private startingLocation: Vector;
    private target!: Vector;
    private maxLength: number;
    private size: number;
    private speed: Vector;
    private removing: boolean = false;
    private setToRemove: boolean = false;

    constructor(startingLocation: Vector, speed: Vector, length: number, size: number) {
        const spriteInfo = Utility.File.getImage(images.trail);
        this.spriteSheet = new SpriteSheet(spriteInfo.src, spriteInfo.frameWidth, spriteInfo.frameHeight);
        this.startingLocation = startingLocation;
        this.maxLength = length;
        this.size = size;
        this.speed = speed;
    }

    public update(deltaTime: number) {
        if (this.removing) {
            this.removeUpdate(deltaTime);
        } else {
            this.setTarget({
                x: this.target.x + this.speed.x * deltaTime,
                y: this.target.y + this.speed.y * deltaTime
            });
        }
    }

    private removeUpdate(deltaTime: number) {
        const nextX = this.startingLocation.x + this.speed.x * deltaTime;
        const nextY = this.startingLocation.y + this.speed.y * deltaTime;
        const goingRight = this.speed.x > 0;
        const goingDown = this.speed.y > 0;
        const passedTargetX = goingRight ? nextX > this.target.x : nextX < this.target.x;
        const passedTargetY = goingDown ? nextY > this.target.y : nextY < this.target.y;
        if (passedTargetX || passedTargetY) {
            this.setToRemove = true;
        } else {
            this.startingLocation = { x: nextX, y: nextY };
        }
    }

    public setTarget(target: Vector): void {
        const DX = target.x - this.startingLocation.x;
        const DY = target.y - this.startingLocation.y;
        const length = Math.hypot(DX, DY);

        if (length > this.maxLength) {
            const ratio = this.maxLength / length;
            this.startingLocation = {
                x: target.x - DX * ratio,
                y: target.y - DY * ratio,
            };
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
        this.spriteSheet.drawLine(0, 0, this.startingLocation, this.target, this.size);
    }
}

export { StaticTrail };