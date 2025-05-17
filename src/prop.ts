import { DynamicObject } from "./dynamicObject";
import { SpriteSheet } from "./sprite";
import { Vector } from "./types";


export class Prop extends DynamicObject {
    private drawSize;
    private spriteSheet: SpriteSheet;

    private drawCol: number;
    private drawRow: number;


    constructor(pos: Vector, width: number, height: number, spriteSheet: SpriteSheet, drawSize: number, drawCol: number, drawRow: number) {
        super(pos, width, height);

        this.spriteSheet = spriteSheet;
        this.drawSize = drawSize;

        this.drawCol = drawCol;
        this.drawRow = drawRow;
    }

    update(deltaTime: number) {     
        this.updatePosition(deltaTime);
    }


    draw(ctx: CanvasRenderingContext2D) {
        this.spriteSheet.draw(ctx, this.drawRow, this.drawCol, this.pos, this.drawSize, false);
    }
}
