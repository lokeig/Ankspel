import { DynamicObject } from "./dynamicObject";
import { SpriteSheet } from "./sprite";
import { StateMachine } from "./stateMachine";
import { Vector } from "./types";


export class itemObject extends DynamicObject {
    public pickedup: boolean = false;

    update(deltaTime: number) {
        if (!this.pickedup) {
            this.updatePosition(deltaTime);
        }
    }
}

export enum itemState {
    Loaded,
    Empty
}

export abstract class Item {
    private drawSize;
    private spriteSheet: SpriteSheet;

    public collidable: boolean = false;
    
    private itemObject: itemObject;
    private stateMachine: StateMachine<itemState, itemObject>;

    private drawCol: number = 0;
    private drawRow: number = 0;


    constructor(pos: Vector, width: number, height: number, spriteSheet: SpriteSheet, drawSize: number) {
        this.itemObject = new itemObject(pos, width, height);
        this.stateMachine = new StateMachine(itemState.Loaded, this.itemObject);

        this.spriteSheet = spriteSheet;
        this.drawSize = drawSize;

        // this.drawCol = drawCol;
        // this.drawRow = drawRow;
    }

    update(deltaTime: number) {     
        //this.stateMachine.update(deltaTime);
        this.itemObject.update(deltaTime);
    }


    draw(ctx: CanvasRenderingContext2D) {
        const xPos = this.itemObject.pos.x + ((this.itemObject.width - this.drawSize) / 2)
        const yPos = this.itemObject.pos.y + (this.itemObject.height - this.drawSize);

        this.spriteSheet.draw(ctx, this.drawRow, this.drawCol, {x: xPos, y: yPos}, this.drawSize, false);
    }
}