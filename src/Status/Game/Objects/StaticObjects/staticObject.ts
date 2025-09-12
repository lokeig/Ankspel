import { SpriteSheet } from "../../Common/Sprite/sprite";
import { Direction } from "../../Common/Types/direction";
import { Neighbours } from "../../Common/Types/neighbours";
import { Vector } from "../../Common/Types/vector";
import { GameObject } from "../Common/gameObject";
import { TileType } from "./tileType";

export abstract class StaticObject extends GameObject {
    public type: TileType;

    protected drawRow: number = 0;
    protected drawCol: number = 0;
    protected drawSize: number;

    protected sprite: SpriteSheet;
    protected spriteLookup: Record<number, [number, number]> = {};
    protected spriteIndex: number = 0;

    public neighbours: Neighbours = {
        left: false, 
        right: false, 
        top: false, 
        bot: false,
        topLeft: false, 
        topRight: false, 
        botRight: false,
        botLeft: false
    }

    public platform: boolean;

    constructor(pos: Vector, sprite: SpriteSheet, type: TileType, width: number, height: number, drawSize: number, platform: boolean = false) {
        super(pos, width, height);
        this.sprite = sprite;
        this.type = type;
        this.drawSize = drawSize;
        this.platform = platform;
    }

    public tileEqual(obj: StaticObject | undefined) {
        return obj && this.type === obj.type;
    }

    public setNeighbour(direction: Direction, value: boolean) {
        this.neighbours[direction] = value;
        this.update();
    }

    public lipLeft: GameObject | undefined = undefined;
    public lipRight: GameObject | undefined = undefined;

    public draw(): void {
        this.sprite.draw(this.drawRow, this.drawCol, this.pos, this.drawSize, false, 0);

        if (this.lipLeft) {
            const drawOffsetX = this.lipLeft.pos.x - (this.width - this.lipLeft.width)
            this.sprite.draw(7, 6, { x: drawOffsetX, y: this.lipLeft.pos.y }, this.drawSize, false, 0);
        }
        if (this.lipRight) {
            this.sprite.draw(7, 7, this.lipRight.pos, this.drawSize, false, 0);
        }
    }

    abstract setSpriteIndex(): void;
    abstract setLip(): void;

    public update() {
        this.setSpriteIndex();
        this.setLip();
        const lookup = this.spriteLookup[this.spriteIndex];
        this.drawRow = lookup ? lookup[0] : 0;
        this.drawCol = lookup ? lookup[1] : 0;
    }
}