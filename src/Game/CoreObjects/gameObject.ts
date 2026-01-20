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

    private onBox(point: Vector) {
        return (
            point.x >= this.pos.x &&
            point.x <= this.pos.x + this.width &&
            point.y >= this.pos.y &&
            point.y <= this.pos.y + this.height
        );
    }

    public lineCollision(lineStart: Vector, lineEnd: Vector): { pos: Vector, collision: boolean } {
        const delta = lineEnd.clone().subtract(lineStart);
        // ─── Edge cases ────────────────────────
        if (delta.x === 0) {
            if (lineStart.x >= this.pos.x && lineStart.x <= this.pos.x + this.width) {
                const minY = Math.min(lineStart.y, lineEnd.y);
                const maxY = Math.max(lineStart.y, lineEnd.y);

                if (maxY >= this.pos.y && minY <= this.pos.y + this.height) {
                    const collisionY = maxY > this.pos.y + this.height ? this.pos.y + this.height : this.pos.y;
                    return { collision: true, pos: new Vector(lineStart.x, collisionY) };
                }
                return { collision: false, pos: this.pos };
            }
        }
        if (delta.y === 0) {
            if (lineStart.y >= this.pos.y && lineStart.y <= this.pos.y + this.height) {
                const minX = Math.min(lineStart.x, lineEnd.x);
                const maxX = Math.max(lineStart.x, lineEnd.x);

                if (maxX >= this.pos.y && minX <= this.pos.y + this.height) {
                    const collisionX = maxX > this.pos.x + this.width ? this.pos.x + this.width : this.pos.x;
                    return { collision: true, pos: new Vector(collisionX, lineStart.y) };
                }
                return { collision: false, pos: this.pos };
            }
        }
        const k = delta.y / delta.x;

        // ─── Calculate X ────────────────────────
        let x1 = ((this.pos.y - lineStart.y) / k) + lineStart.x;
        let x2 = ((this.pos.y + this.height - lineStart.y) / k) + lineStart.x;

        const collisionX1 = new Vector(x1, this.pos.y);
        const collisionX2 = new Vector(x2, this.pos.y + this.height);

        // ─── Calculate Y ────────────────────────
        let y1 = k * (this.pos.x - lineStart.x) + lineStart.y;
        let y2 = k * (this.pos.x + this.width - lineStart.x) + lineStart.y;

        const collisionY1 = new Vector(this.pos.x, y1);
        const collisionY2 = new Vector(this.pos.x + this.width, y2);

        // ─── Get all points colliding with box ────────────────────────
        const colliding: Vector[] = [];
        const checkX = (pos: Vector) => {
            if (this.onBox(pos) && (pos.y - lineStart.y) * Math.sign(delta.y) > 0) {
                colliding.push(pos);
            }
        }
        const checkY = (pos: Vector) => {
            if (this.onBox(pos) && (pos.x - lineStart.x) * Math.sign(delta.x) > 0) {
                colliding.push(pos);
            }
        }
        checkX(collisionX1);
        checkX(collisionX2);
        checkY(collisionY1);
        checkY(collisionY2);

        if (colliding.length === 0) {
            return { collision: false, pos: this.pos };
        }

        // ─── Find nearest point ────────────────────────
        colliding.sort((a, b) => {
            const aLength = Math.pow(lineStart.x - a.x, 2) + Math.pow(lineStart.y - a.y, 2);
            const bLength = Math.pow(lineStart.x - b.x, 2) + Math.pow(lineStart.y - b.y, 2);
            return aLength - bLength;
        });
        const collisionPoint = colliding[0];
        const length = Math.pow(lineStart.x - collisionPoint.x, 2) + Math.pow(lineStart.y - collisionPoint.y, 2);
        if (length > Math.pow(delta.x, 2) + Math.pow(delta.y, 2)) {
            return { collision: false, pos: this.pos };
        }

        return { collision: true, pos: collisionPoint };
    }
}

export { GameObject };