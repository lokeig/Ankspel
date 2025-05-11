import { GameObject } from "./gameobject";
import { Grid } from "./grid";
import { SpriteSheet } from "./sprite";
import { Direction, Neighbours, Vector } from "./types";

export type tileType = "GRASS" | "ICE" | "STONE"

const spriteLookup: Record<number, [number, number]> = {
    0:  [5, 0],    
    1:  [5, 4],   
    2:  [4, 0],   
    3:  [7, 2],
    4:  [6, 1],  
    5:  [6, 2],  
    6:  [6, 3],  
    7:  [6, 5],
    8:  [4, 5],   
    9:  [7, 4], 
    10: [4, 4],  
    11: [7, 1],   
    12: [6, 4],  
    13: [5, 5],   
    14: [4, 2],   
    15: [5, 2],   
    19: [3, 2],
    23: [0 ,7],
    27: [3, 1],
    31: [3, 0],
    41: [3, 4],
    43: [3, 5],
    45: [1, 7],
    47: [3, 6],
    59: [3, 3],
    63: [2, 7],
    70: [0, 2],
    71: [0, 2],
    78: [0, 2],
    79: [1, 0],
    87: [2, 2],
    95: [2, 0],
    111: [6, 5],
    127: [2, 1],
    140: [0, 4],
    141: [0, 4],
    142: [1, 6],
    143: [1, 6],
    159: [3, 0],
    173: [2, 4],
    175: [2, 6],
    191: [2, 5],
    206: [0, 3],
    207: [0, 3],
    223: [1, 2],
    239: [1, 4],
    255: [1, 3]
};

export abstract class GridObject extends GameObject {
    public type: tileType;

    protected drawRow: number = 0;
    protected drawCol: number = 0;

    protected spriteIndex: number = 0;
    public neighbours: Neighbours = { left: false, right: false, top: false, bot: false, topLeft: false, topRight: false, botRight: false, botLeft: false }
    protected sprite: SpriteSheet;

    public platform: boolean;

    constructor(pos: Vector, sprite: SpriteSheet, type: tileType, width: number, height: number, platform = false){
        super(pos, width, height);
        this.sprite = sprite;
        this.type = type;
        this.platform = platform;
    }

    tileEqual(obj: GridObject | undefined){
        if (!obj) return false;
        return this.type === obj.type;
    }

    setNeighbour(direction: Direction, value: boolean) {
        this.neighbours[direction] = value;
        this.update();
    }

    public blipLeft:  Blip | undefined = undefined;
    public blipRight: Blip | undefined = undefined;

    draw(ctx: CanvasRenderingContext2D): void {
        const size = Math.max(this.height, this.width);
        this.sprite.draw(ctx, this.drawRow, this.drawCol, this.pos, size, false);
        if (this.blipLeft)  this.sprite.draw(ctx, 7, 6, { x: this.blipLeft.pos.x - (this.width - this.blipLeft.width), y: this.blipLeft.pos.y },  size, false);
        if (this.blipRight) this.sprite.draw(ctx, 7, 7, this.blipRight.pos, size, false)
    }

    abstract update(): void;
}

export class Tile extends GridObject{
    private size: number;

    constructor(pos: Vector, sprite: SpriteSheet, type: tileType, size: number, platform = false){
        super(pos, sprite, type, size, size, platform);
        this.size = size;
    }

    update(){
        this.setSpriteIndex();
        const lookup = spriteLookup[this.spriteIndex];
        this.drawRow = lookup ? lookup[0] : 3;
        this.drawCol = lookup ? lookup[1] : 3;
    }

    setSpriteIndex() { 
        this.spriteIndex = 0;

        const { top, right, bot, left, topLeft, topRight, botLeft, botRight } = this.neighbours

        if (top)   this.spriteIndex += 1;
        if (right) this.spriteIndex += 2;
        if (bot)   this.spriteIndex += 4;
        if (left)  this.spriteIndex += 8;

        if (right && top && topRight)  this.spriteIndex += 16;
        if (left  && top && topLeft)   this.spriteIndex += 32;
        if (right && bot && botRight)  this.spriteIndex += 64;
        if (left  && bot && botLeft)   this.spriteIndex += 128;

        let hasBlipLeft  = false;
        let hasBlipRight = false;
        if (!top) {
            if (!left) hasBlipLeft = true;
            if (!right) hasBlipRight = true;
        }
        if (top && bot) {
            if (botRight && right && !topRight && !left)  hasBlipLeft  = true;
            if (botLeft  && left  && !topLeft  && !right) hasBlipRight = true;
        }

        const width = Math.floor(this.size / 4)
        if (hasBlipLeft) this.blipLeft   = new Blip({x: this.pos.x - width, y: this.pos.y}, this.sprite, this.type, width, this.height) 
            else this.blipLeft = undefined;
        if (hasBlipRight) this.blipRight = new Blip({x: this.pos.x + Grid.tileSize, y: this.pos.y}, this.sprite, this.type, width, this.height)
            else this.blipRight = undefined;
    }
}


export class Blip extends GridObject {
    constructor(pos: Vector, sprite: SpriteSheet, type: tileType, width: number, height: number){
        super(pos, sprite, type, width, height, true);
    }

    update() { }
}

