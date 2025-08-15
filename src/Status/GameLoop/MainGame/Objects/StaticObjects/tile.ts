
import { SpriteSheet } from "../../Common/Sprite/sprite";
import { Vector } from "../../Common/Types/vector";
import { StaticObject } from "./staticObject";
import { tileType as TileType } from "./tileType";


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

export class Tile extends StaticObject{
    private size: number;

    constructor(pos: Vector, sprite: SpriteSheet, type: TileType, width: number, height: number, drawSize: number, platform = false){
        super(pos, sprite, type, width, height, drawSize, platform);
        this.size = Math.max(width, height);
        this.spriteLookup = spriteLookup;
    }

    setSpriteIndex() { 
        this.spriteIndex = 0;

        const { top, right, bot, left, topLeft, topRight, botLeft, botRight } = this.neighbours;

        if (top)   this.spriteIndex += 1;
        if (right) this.spriteIndex += 2;
        if (bot)   this.spriteIndex += 4;
        if (left)  this.spriteIndex += 8;

        if (right && top && topRight)  this.spriteIndex += 16;
        if (left  && top && topLeft)   this.spriteIndex += 32;
        if (right && bot && botRight)  this.spriteIndex += 64;
        if (left  && bot && botLeft)   this.spriteIndex += 128;
    }

    setLip() {
        const { top, right, bot, left, topLeft, topRight, botLeft, botRight } = this.neighbours;

        let hasLipLeft  = false;
        let hasLipRight = false;
        if (!top) {
            if (!left) {
                hasLipLeft = true;
            }
            if (!right) {
                hasLipRight = true;
            }
        }
        if (top && bot) {
            if (botRight && right && !topRight && !left)  {
                hasLipLeft  = true;
            }
            if (botLeft  && left  && !topLeft  && !right) {
                hasLipRight = true;
            }
        }

        const width = Math.floor(this.size / 4)

        if (hasLipLeft) {
            this.lipLeft = new Tile({ x: this.pos.x - width, y: this.pos.y }, this.sprite, this.type, width, this.height, this.drawSize, true) 
        } else {
            this.lipLeft = undefined;
        }

        if (hasLipRight) {
            this.lipRight = new Tile({ x: this.pos.x + this.width, y: this.pos.y }, this.sprite, this.type, width, this.height, this.drawSize, true)
        } else { 
            this.lipRight = undefined; 
        }
    }
}

