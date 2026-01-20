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

    public clone(): Vector {
        return new Vector(this.x, this.y)
    }
}

export { Vector };