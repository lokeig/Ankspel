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
        const centerX = this.pos.x + this.width/2;
        const centerY = this.pos.y + this.height/2;
        return {x: centerX, y: centerY}
    }

    public getPos(): Vector {
        return this.pos;
    }

    public getCorners(): Record<string, Vector>{
        return {
            TL: this.pos,
            BL: { x: this.pos.x, y: this.pos.y + this.height },
            TR: { x: this.pos.x + this.width, y: this.pos.y },
            BR: { x: this.pos.x + this.width, y: this.pos.y + this.height }
        };
    }

    public setCenterToPos(pos: Vector): void {
        this.pos.x = pos.x - this.width / 2;
        this.pos.y = pos.y - this.height / 2;
    }


    public collision(block: GameObject): boolean {
        return (
            this.pos.x < block.pos.x + block.width  &&
            this.pos.x + this.width > block.pos.x   &&
            this.pos.y < block.pos.y + block.height &&
            this.pos.y + this.height > block.pos.y
        );    
    }
    
    public getScaled(scaleX: number, scaleY: number) {
        const pos = {
            x: this.pos.x - (scaleX / 2),
            y: this.pos.y - (scaleY / 2)
        };
        const width = this.width + scaleX;
        const height = this.height + scaleY;
        return new GameObject(pos, width, height);
    }
}

export { GameObject };