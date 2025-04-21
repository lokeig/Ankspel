import { Vector } from "./types";
import { SpriteSheet } from "./sprite";

export abstract class GameObject {
    protected pos: Vector;
    protected width: number;
    protected height: number;
    protected velocity: Vector = { x: 0, y: 0 };
    protected sprite: SpriteSheet;
    protected drawSize: number;

    constructor(pos: Vector, width: number, height: number, sprite: SpriteSheet, drawSize: number) {
        this.pos = pos;
        this.width = width;
        this.height = height;
        this.sprite = sprite;
        this.drawSize = drawSize;
    }

    getCenter(): Vector {
        const centerX = this.pos.x + this.width/2;
        const centerY = this.pos.y + this.height/2;
        return {x: centerX, y: centerY}
    }

    abstract update(deltaTime: number): void;
    abstract draw(ctx: CanvasRenderingContext2D, deltaTime: number): void;
}