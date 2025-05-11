import { Vector } from "./types";

export abstract class GameObject {
    public pos: Vector;
    public width: number;
    public height: number;
 
    constructor(pos: Vector, width: number, height: number) {
        this.pos = pos;
        this.width = width;
        this.height = height;
    }

    getCenter(): Vector {
        const centerX = this.pos.x + this.width/2;
        const centerY = this.pos.y + this.height/2;
        return {x: centerX, y: centerY}
    }

    getPos(): Vector {
        return this.pos;
    }

    getCorners(): Record<string, Vector>{
        return {
            TL: this.pos,
            BL: { x: this.pos.x, y: this.pos.y + this.height },
            TR: { x: this.pos.x + this.width, y: this.pos.y },
            BR: { x: this.pos.x + this.width, y: this.pos.y + this.height },
        };
    }

    collision(block: GameObject): boolean {
        return (
            this.pos.x < block.pos.x + block.width  &&
            this.pos.x + this.width > block.pos.x   &&
            this.pos.y < block.pos.y + block.height &&
            this.pos.y + this.height > block.pos.y
        );    
    }
}