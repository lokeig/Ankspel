import { DynamicObject } from "./dynamicObject";
import { SpriteSheet } from "./sprite";
import { Vector } from "./types";


export abstract class Item extends DynamicObject {
    private drawSize;
    private spriteSheet: SpriteSheet;

    private drawCol: number = 0;
    private drawRow: number = 0;


    constructor(pos: Vector, width: number, height: number, spriteSheet: SpriteSheet, drawSize: number) {
        super(pos, width, height);

        this.spriteSheet = spriteSheet;
        this.drawSize = drawSize;

        // this.drawCol = drawCol;
        // this.drawRow = drawRow;
    }

    update(deltaTime: number) {     
        this.updatePosition(deltaTime);
    }


    draw(ctx: CanvasRenderingContext2D) {
        const xPos = this.pos.x + ((this.width - this.drawSize) / 2)
        const yPos = this.pos.y + (this.height - this.drawSize);

        this.spriteSheet.draw(ctx, this.drawRow, this.drawCol, {x: xPos, y: yPos}, this.drawSize, false);
    }
}

export class Prop extends Item {

}