class Vector {
    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    public multiply(amount: number | Vector): Vector {
        if (amount instanceof Vector) {
            this.x *= amount.x;
            this.y *= amount.y;
        } else {
            this.x *= amount;
            this.y *= amount;
        }
        return this;
    }

    public divide(amount: number | Vector): Vector {
        if (amount instanceof Vector) {
            this.x /= amount.x;
            this.y /= amount.y;
        } else {
            this.x /= amount;
            this.y /= amount;
        }
        return this;
    }

    public add(amount: number | Vector): Vector {
        if (amount instanceof Vector) {
            this.x += amount.x;
            this.y += amount.y;
        } else {
            this.x += amount;
            this.y += amount;
        }
        return this;
    }

    public subtract(amount: number | Vector): Vector {
        if (amount instanceof Vector) {
            this.x -= amount.x;
            this.y -= amount.y;
        } else {
            this.x -= amount;
            this.y -= amount;
        }
        return this;
    }

    public distanceToSquared(end: Vector): number {
        return Math.pow(end.x - this.x, 2) + Math.pow(end.y - this.y, 2);
    }

    public set(x: number, y: number): Vector {
        this.x = x;
        this.y = y;
        return this;
    }

    public normalize(): Vector {
        const length = Math.sqrt(this.lengthSquared());
        this.x /=  length;
        this.y /= length;
        return this;
    }

    public lengthSquared(): number {
        return (this.x * this.x) + (this.y * this.y);
    }

    public clone(): Vector {
        return new Vector(this.x, this.y);
    }
}

export { Vector };