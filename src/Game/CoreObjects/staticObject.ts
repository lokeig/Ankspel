import { Direction, Side, Vector } from "@common";
import { GameObject } from "./gameObject";

class StaticObject extends GameObject {

    private neighbours: Set<Direction> = new Set();
    private lipLeft: boolean = false;
    private lipRight: boolean = false;
    private platform: boolean = false;

    constructor(pos: Vector, size: number, platform: boolean) {
        super(pos, size, size);
        this.platform = platform;
    }

    public setLip(direction: Side, value: boolean): void {
        if (direction === Side.Left) {
            this.lipLeft = value;
        } else {
            this.lipRight = value;
        }
    }

    public getLip(direction: Side): boolean {
        if (direction === Side.Left) {
            return this.lipLeft;
        } else {
            return this.lipRight;
        }
    }

    public getLipDrawPos(side: Side): Vector {
        if (side === Side.Left) {
            return new Vector(
                this.pos.x - this.width,
                this.pos.y
            )
        } else {
            return new Vector(
                this.pos.x + this.width,
                this.pos.y
            )
        }
    }

    public getLipWidth(): number {
        const lipWidth = 8;
        return lipWidth;
    }

    public isPlatform(): boolean {
        return this.platform;
    }

    public setNeighbour(direction: Direction) {
        this.neighbours.add(direction);
    }

    public removeNeighbour(direction: Direction) {
        this.neighbours.delete(direction);
    }

    public isNeighbour(direction: Direction): boolean {
        return this.neighbours.has(direction);
    }

    public getNeighbours(): Set<Direction> {
        return this.neighbours;
    }
}

export { StaticObject };
