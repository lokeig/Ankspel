import { GameObject } from "./gameobject";
import { SpriteSheet } from "./sprite";
import { Vector } from "./types";

type tileType = "GRASS" | "ICE" | "STONE"

export class Tile extends GameObject {
    type: tileType;

    private drawRow: number = 0;
    private drawCol: number = 0;
    private spriteIndex: number = 0;

    constructor(pos: Vector, width: number, height: number, sprite: SpriteSheet, type: tileType, drawSize: number){
        super(pos, width, height, sprite, drawSize);

        this.type = type;
    }

    getType(): string {
        return this.type;
    }

    update(){
    }

    updateRowCol(){
        this.getNeighbours();
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
        };
        const lookup = spriteLookup[this.spriteIndex];
        this.drawRow = lookup ? lookup[0] : 0;
        this.drawCol = lookup ? lookup[1] : 0;
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.sprite.draw(ctx, this.drawRow, this.drawCol, this.pos, this.drawSize, false);
    }

    tileEqual(tile: Tile | undefined){
        if (!tile) return false;
        return this.sprite.image.src === tile.sprite.image.src
    }

    getNeighbours() {
        const x = Grid.getGridPos(this.pos).x;
        const y = Grid.getGridPos(this.pos).y;

        this.spriteIndex = 0;

        const top   = this.tileEqual(Grid.getCell({ x: x, y: y - 1 }));
        const right = this.tileEqual(Grid.getCell({ x: x + 1, y: y }));
        const bot   = this.tileEqual(Grid.getCell({ x: x, y: y + 1 }));
        const left  = this.tileEqual(Grid.getCell({ x: x - 1, y: y }));

        // Cardinal
        if (top)   this.spriteIndex += 1;
        if (right) this.spriteIndex += 2;
        if (bot)   this.spriteIndex += 4;
        if (left)  this.spriteIndex += 8;

        // Diagonal
        const topRight = this.tileEqual(Grid.getCell({ x: x + 1, y: y - 1 })); 
        const topLeft  = this.tileEqual(Grid.getCell({ x: x - 1, y: y - 1 })); 
        const botRight = this.tileEqual(Grid.getCell({ x: x + 1, y: y + 1 })); 
        const botLeft  = this.tileEqual(Grid.getCell({ x: x - 1, y: y + 1 })); 


        if (right && topRight) this.spriteIndex += 16;
        if (left  && topLeft ) this.spriteIndex += 32;
        if (right && bot && botRight ) this.spriteIndex += 32;
        if (left  && bot && botLeft )  this.spriteIndex += 32;


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

    static getNearbyTiles(object: GameObject): Set<Tile> {        

        const pos =    object.getPos();
        const width =  object.getWidth();
        const height = object.getHeight();

        const nearbyTiles: Set<Tile> = new Set();

        let posX = pos.x - this.tileSize;
        let posY = pos.y - this.tileSize;
        while (posX < pos.x + width + this.tileSize) {
            posY = pos.y - this.tileSize;
            while (posY < pos.y + height + this.tileSize) {
                const gridPos = this.getGridPos({ x: posX, y: posY });
                if (this.isBlock(gridPos)) nearbyTiles.add(this.getCell(gridPos)!);
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
        return this.tiles.get(this.key(pos)) !== undefined
    }

    static getCell(pos: Vector): Tile | undefined{
        return this.tiles.get(this.key(pos));
    }
    
    static setTile(gridPos: Vector, sprite: SpriteSheet, type: tileType) {
        const size = this.tileSize;
        const pos = this.getWorldPos(gridPos);
        const value = new Tile(pos, size, size, sprite, type, size)

        this.tiles.set(this.key(gridPos), value);
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
            tile.updateRowCol();
        }
    }
}