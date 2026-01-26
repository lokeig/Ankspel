import { Vector } from "@common";

class GameObject {
    public pos: Vector;
    public width: number;
    public height: number;

    constructor(pos: Vector, width: number, height: number) {
        this.pos = pos;
        this.width = width;
        this.height = height;
    }

    public getCenter(): Vector {
        const centerX = this.pos.x + this.width / 2;
        const centerY = this.pos.y + this.height / 2;
        return new Vector(centerX, centerY);
    }

    public getPos(): Vector {
        return this.pos;
    }

    public getCorners(): Record<string, Vector> {
        return {
            TL: this.pos.clone(),
            BL: new Vector(this.pos.x, this.pos.y + this.height),
            TR: new Vector(this.pos.x + this.width, this.pos.y),
            BR: new Vector(this.pos.x + this.width, this.pos.y + this.height)
        };
    }

    public setCenterToPos(pos: Vector): void {
        this.pos.x = pos.x - this.width / 2;
        this.pos.y = pos.y - this.height / 2;
    }


    public collision(block: GameObject): boolean {
        return (
            this.pos.x < block.pos.x + block.width &&
            this.pos.x + this.width > block.pos.x &&
            this.pos.y < block.pos.y + block.height &&
            this.pos.y + this.height > block.pos.y
        );
    }

    public scale(scaleX: number, scaleY: number) {
        const pos = new Vector(
            this.pos.x - (scaleX / 2),
            this.pos.y - (scaleY / 2)
        );
        const width = this.width + scaleX;
        const height = this.height + scaleY;
        return new GameObject(pos, width, height);
    }

    public lineCollision(start: Vector, end: Vector): { collision: boolean; pos: Vector } {
        const delta = end.clone().subtract(start);

        let tMin = 0;
        let tMax = 1;

        const checkAxis = (start: number, delta: number, min: number, max: number): boolean => {
            if (Math.abs(delta) < 0.0001) {
                return start >= min && start <= max;
            }
            const t1 = (min - start) / delta;
            const t2 = (max - start) / delta;
            const tNear = Math.min(t1, t2);
            const tFar = Math.max(t1, t2);

            tMin = Math.max(tMin, tNear);
            tMax = Math.min(tMax, tFar);

            return tMin <= tMax;
        };

        if (
            !checkAxis(start.x, delta.x, this.pos.x, this.pos.x + this.width) ||
            !checkAxis(start.y, delta.y, this.pos.y, this.pos.y + this.height)
        ) {
            return { collision: false, pos: this.pos };
        }

        const collisionPoint = start.clone().add(delta.multiply(tMin));
        return { collision: true, pos: collisionPoint };
    }

}

export { GameObject };