import { SpriteSheet, images, Vector } from "@common";

class StaticTrail {
    private spriteSheet = new SpriteSheet(images.bullet, 8, 1);
    private startingLocation: Vector;
    private target!: Vector;
    private maxLength: number;
    private size: number;
    private speed: Vector;
    public removing: boolean = false;
    public setToRemove: boolean = false;

    constructor(startingLocation: Vector, speed: Vector, length: number, size: number) {
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

    public draw(): void {
        this.spriteSheet.drawLine(0, 0, this.startingLocation, this.target, this.size);
    }
}

export { StaticTrail };