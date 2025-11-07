import { Vector } from "@common";

class PlayerArm {
    private drawSize: number = 32;
    public pos: Vector = { x: 0, y: 0 };
    public angle: number = 0;
    private posOffset: Vector = { x: 0, y: 0 };
    private rotateSpeed: number = 25;

    public getCenter(): Vector {
        return {
            x: this.pos.x + (this.drawSize / 2),
            y: this.pos.y + (this.drawSize / 2)
        };
    }

    public setPosition(playerPos: Vector, playerDrawSize: number, offset: Vector, flip: boolean): void {
        const result = { ...playerPos };
        if (flip) {
            result.x += playerDrawSize - this.drawSize - this.posOffset.x - offset.x;
        } else {
            result.x += this.posOffset.x + offset.x
        }
        result.y += this.posOffset.y + offset.y;
        this.pos = result;
    }

    public setOffset(offset: Vector): void {
        this.posOffset = { ...offset };
    }

    public getOffset(): Vector {
        return this.posOffset;
    }

    public getDrawSize(): number {
        return this.drawSize;
    }

    public rotateArmUp(deltaTime: number): void {
        this.angle -= (deltaTime * this.rotateSpeed);
        this.angle = Math.max(this.angle, -Math.PI / 2)
    }

    public rotateArmDown(deltaTime: number): void {
        this.angle += deltaTime * this.rotateSpeed;
        this.angle = Math.min(this.angle, 0);
    }
}

export { PlayerArm };