import { DynamicObject } from "./dynamicObject";
import { PlayerObject } from "./Player/playerObject";
import { SpriteSheet } from "./sprite";
import { Direction, Vector } from "./types";

export enum ThrowType {
    drop,
    upwards,
    light,
    hard,
    hardDiagonal
}

export abstract class Item extends DynamicObject{

    protected drawSize;
    protected spriteSheet: SpriteSheet;

    public collidable: boolean = false;
    public owner: PlayerObject | undefined; // Spawner eventually

    protected drawCol: number = 0;
    protected drawRow: number = 0;

    constructor(pos: Vector, width: number, height: number, spriteSheet: SpriteSheet, drawSize: number) {
        super(pos, width, height);
        this.spriteSheet = spriteSheet;
        this.drawSize = drawSize;
    }

    abstract interact(): void;
    abstract itemUpdate(deltaTime: number): void;
    update(deltaTime: number): void {
        if (this.owner) {
            this.pos.x += this.owner.velocity.x;
            this.pos.y += this.owner.velocity.y;
            this.direction = this.owner.direction;
        } else {
            this.physicsPositionUpdate(deltaTime)
        }
        this.itemUpdate(deltaTime);
    }

    throw(throwType: ThrowType) {

    }

    draw(ctx: CanvasRenderingContext2D) {
        const xPos = this.pos.x + ((this.width - this.drawSize) / 2);
        const yPos = this.pos.y + (this.height - this.drawSize);

        const flip = this.direction === "left";

        this.spriteSheet.draw(ctx, this.drawRow, this.drawCol, {x: xPos, y: yPos}, this.drawSize, flip);
    }
}