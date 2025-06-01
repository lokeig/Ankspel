import { SpriteSheet } from "../../Common/sprite";
import { Vector } from "../../Common/types";
import { DynamicObject } from "../Common/dynamicObject";


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
    public owned: boolean = false;

    protected drawCol: number = 0;
    protected drawRow: number = 0;

    public delete: boolean = false;

    constructor(pos: Vector, width: number, height: number, spriteSheet: SpriteSheet, drawSize: number) {
        super(pos, width, height);
        this.spriteSheet = spriteSheet;
        this.drawSize = drawSize;
    }

    abstract interact(): Vector;
    abstract itemUpdate(deltaTime: number): void;

    public update(deltaTime: number): void {
        this.friction = this.grounded ? 5 : 1;
        if (!this.owned) {
            this.physicsPositionUpdate(deltaTime)
        }
        this.itemUpdate(deltaTime);
    }

    public throw(throwType: ThrowType) {
        this.grounded = false;
        this.owned = false;
        const direcMult = this.getDirectionMultiplier();

        switch (throwType) {
            case(ThrowType.light): {
                this.velocity = { x: 3.5 * direcMult, y: -2.5 };
                break;
            }
            case(ThrowType.hard): {
                this.velocity = { x: 15 * direcMult, y: -5 };
                break;
            }
            case(ThrowType.hardDiagonal): {
                this.velocity = { x: 15 * direcMult, y: -10 };
                break;
            }
            case(ThrowType.drop): {
                this.velocity = { x: 0 * direcMult, y: 0 };
                break;
            }
            case(ThrowType.upwards): {
                this.velocity = { x: 0 * direcMult, y: -10 };
                break;
            }
        }
    }

    public shouldBeDeleted(): boolean {
        return !this.owned && this.grounded && (this.velocity.x < 5) && this.delete;
    }

    public draw() {
        const xPos = this.pos.x + ((this.width - this.drawSize) / 2);
        const yPos = this.pos.y + (this.height - this.drawSize);
        const flip = this.direction === "left";

        this.spriteSheet.draw(this.drawRow, this.drawCol, {x: xPos, y: yPos}, this.drawSize, flip);
    }
}