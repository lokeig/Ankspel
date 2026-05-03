import { Vector } from "@math";

class PlayerArm {
    private drawSize: number = 32;
    public pos = new Vector();
    public angle: number = 0;
    private posOffset = new Vector();
    private rotateSpeed: number = 25;
    private rotateOffset = new Vector(4, 4);

    public getCenter(): Vector {
        return new Vector(
            this.pos.x + (this.drawSize / 2),
            this.pos.y + (this.drawSize / 2)
        );
    }

    public setPosition(playerPos: Vector, playerDrawSize: number, offset: Vector, flip: boolean): void {
        offset = offset.clone();
        offset.add(this.getRotationOffset());
        
        const result = playerPos.clone();
        
        if (flip) {
            result.x += playerDrawSize - this.drawSize - this.posOffset.x - offset.x;
        } else {
            result.x += this.posOffset.x + offset.x
        }
        result.y += this.posOffset.y + offset.y;
        this.pos = result;
    }

    public getRotationOffset(): Vector {
        const normalized = (2 * this.angle / Math.PI);
        return this.rotateOffset.clone().multiply(normalized);
    }

    public setOffset(offset: Vector): void {
        this.posOffset = offset.clone();
    }

    public getTruePos(): void {

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