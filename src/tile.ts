import { GameObject } from "./gameobject";
import { SpriteSheet } from "./sprite";
import { Vector } from "./types";

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

export class Tile extends GameObject{
    type: tileType;

    private drawRow: number = 0;
    private drawCol: number = 0;
    private spriteIndex: number = 0;

    private sprite: SpriteSheet;
    private size: number;

    public platform: boolean;

    constructor(pos: Vector, sprite: SpriteSheet, type: tileType, size: number, platform = false){
        super(pos, size, size);
        this.sprite = sprite;
        this.type = type;
        this.size = size;
        this.platform = platform;
    }

    updateRowCol(){
        this.setSpriteIndex();
        const lookup = spriteLookup[this.spriteIndex];
        this.drawRow = lookup ? lookup[0] : 0;
        this.drawCol = lookup ? lookup[1] : 0;
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.sprite.draw(ctx, this.drawRow, this.drawCol, this.pos, this.size, false);
        if (this.blipLeft)  this.sprite.draw(ctx, 7, 6, Grid.snap(this.blipLeft.pos),  this.size, false);
        if (this.blipRight) this.sprite.draw(ctx, 7, 7, this.blipRight.pos, this.size, false)

    }

    tileEqual(tile: Tile | undefined){
        if (!tile) return false;
        return this.sprite.image.src === tile.sprite.image.src
    }

    public blipLeft:  Blip | undefined = undefined;
    public blipRight: Blip | undefined = undefined;

    setSpriteIndex() { 
        this.spriteIndex = 0;

        const neighbours = Grid.getNeighbours(Grid.getGridPos(this.pos));

        const top   = this.tileEqual(neighbours.get("top"));
        const right = this.tileEqual(neighbours.get("right"));
        const bot   = this.tileEqual(neighbours.get("bot"));
        const left  = this.tileEqual(neighbours.get("left"));

        // Cardinal
        if (top)   this.spriteIndex += 1;
        if (right) this.spriteIndex += 2;
        if (bot)   this.spriteIndex += 4;
        if (left)  this.spriteIndex += 8;

        // Diagonal
        const topRight = this.tileEqual(neighbours.get("topRight")); 
        const topLeft  = this.tileEqual(neighbours.get("topLeft")); 
        const botRight = this.tileEqual(neighbours.get("botRight")); 
        const botLeft  = this.tileEqual(neighbours.get("botLeft")); 

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
        if (hasBlipLeft) this.blipLeft  = new Blip({x: this.pos.x - width, y: this.pos.y}, this.sprite, this.type, width, this.height) 
            else this.blipLeft = undefined;
        if (hasBlipRight) this.blipRight  = new Blip({x: this.pos.x + Grid.tileSize, y: this.pos.y}, this.sprite, this.type, width, this.height)
            else this.blipRight = undefined;
    }
}


export class Blip extends GameObject {
    public sprite: SpriteSheet;
    public type: tileType;
    public platform = true;
    constructor(pos: Vector, sprite: SpriteSheet, type: tileType, width: number, height: number){
        super(pos, width, height);
        this.sprite = sprite;
        this.type = type;
    }
}

export class Grid {
    static tileSize: number;
    static tiles: Map<string, Tile>

    static init(size: number) {
        this.tileSize = size;
        this.tiles = new Map<string, Tile>();
    }

    static getGridPos(pos: Vector): Vector {
        return { x: Math.floor(pos.x / this.tileSize), y: Math.floor(pos.y / this.tileSize) }
    }

    static getWorldPos(gridPos: Vector): Vector {
        return { x: gridPos.x * this.tileSize, y: gridPos.y * this.tileSize } 
    }

    static snap(pos: Vector): Vector {
        return this.getWorldPos(this.getGridPos(pos));
    }

    static getNearbyTiles(gameobject: GameObject): Array<Tile | Blip> {        
        const nearbyTiles: Array<Tile | Blip> = []
        const pos = gameobject.pos;
        const width = gameobject.width;
        const height = gameobject.height;
        
        let posX = pos.x - this.tileSize * 2;
        let posY = pos.y - this.tileSize * 2;
        while (posX < pos.x + width + this.tileSize * 2) {
            posY = pos.y - this.tileSize * 2;
            while (posY < pos.y + height + this.tileSize * 2) {
                const gridPos = this.getGridPos({ x: posX, y: posY });
                if (this.isBlock(gridPos)) {
                    const tile = this.getCell(gridPos)!;
                    nearbyTiles.push(tile)
                    if (tile.blipLeft)  nearbyTiles.push(tile.blipLeft);
                    if (tile.blipRight) nearbyTiles.push(tile.blipRight);
                }
                posY += this.tileSize;
            }
            posX += this.tileSize;
        }
        return nearbyTiles;
    }

    static key(pos: Vector): string {
        return `${pos.x},${pos.y}`;
    }

    static isBlock(pos: Vector): boolean {
        return this.tiles.get(this.key(pos)) !== undefined;
    }

    static getCell(pos: Vector): Tile | undefined{
        return this.tiles.get(this.key(pos));
    }
    
    static setTile(gridPos: Vector, sprite: SpriteSheet, type: tileType) {
        const size = this.tileSize;
        const pos = this.getWorldPos(gridPos);
        const value = new Tile(pos, sprite, type, size)
        value.updateRowCol();
        
        this.tiles.set(this.key(gridPos), value);

        const neighbours = this.getNeighbours(gridPos);
        for (const neighbour of neighbours.values()) {
            neighbour.updateRowCol();
        }
    }

    static getNeighbours(gridPos: Vector): Map<string, Tile> {
        const x = gridPos.x;
        const y = gridPos.y;

        const top   = { x: x, y: y - 1 };
        const right = { x: x + 1, y: y };
        const bot   = { x: x, y: y + 1 };
        const left  = { x: x - 1, y: y };

        const topRight = { x: x + 1, y: y - 1 }; 
        const topLeft  = { x: x - 1, y: y - 1 }; 
        const botRight = { x: x + 1, y: y + 1 }; 
        const botLeft  = { x: x - 1, y: y + 1 }; 

        const map = new Map<string, Tile>;
        if (this.isBlock(top))      map.set("top",      this.getCell(top)!);
        if (this.isBlock(right))    map.set("right",    this.getCell(right)!);
        if (this.isBlock(left))     map.set("left",     this.getCell(left)!);
        if (this.isBlock(bot))      map.set("bot",      this.getCell(bot)!);
        if (this.isBlock(topRight)) map.set("topRight", this.getCell(topRight)!);
        if (this.isBlock(topLeft))  map.set("topLeft",  this.getCell(topLeft)!);
        if (this.isBlock(botRight)) map.set("botRight", this.getCell(botRight)!);
        if (this.isBlock(botLeft))  map.set("botLeft",  this.getCell(botLeft)!);

        return map;
    }

    static setArea(pos: Vector, width: number, height: number, sprite: SpriteSheet, type: tileType) {
        for (let i = 0; i < width; i++) {
            const posX = pos.x + i;
            for (let j = 0; j < height; j++) {
                const posY = pos.y + j;
                this.setTile({x: posX, y: posY}, sprite, type);
            }
        }
    }

    static draw(ctx: CanvasRenderingContext2D) {
        for (const tile of this.tiles.values()) {
            tile.draw(ctx);
        }
    }
}