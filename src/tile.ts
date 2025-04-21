import { SpriteSheet } from "./sprite";
import { Vector } from "./types";

type tileType = "GRASS" | "ICE" | "STONE"

export class Tile {
    pos: Vector;
    spriteSheet: SpriteSheet;
    type: tileType;

    constructor(pos: Vector, sprite: SpriteSheet, type: tileType){
        this.pos = pos;
        this.spriteSheet = sprite;
        this.type = type;
    }

    getType(): string {
        return this.type;
    }
}

export class Grid {
    tileSize: number;
    tiles: Map<string, Tile>;

    constructor(tileSize: number) {
        this.tileSize = tileSize;
        this.tiles = new Map();
    }

    private key(pos: Vector): string {
        return `${pos.x},${pos.y}`;
    }

    getCell(pos: Vector): Tile | undefined{
        return this.tiles.get(this.key(pos));
    }

    isBlock(pos: Vector): boolean {
        return this.tiles.get(this.key(pos)) !== undefined
    }

    setTile(pos: Vector, sprite: SpriteSheet, type: tileType) {
        const value = new Tile(pos, sprite, type)
        this.tiles.set(this.key(pos), value);
    }

    setArea(pos: Vector, width: number, height: number, sprite: SpriteSheet, type: tileType) {
        for (let i = 0; i < width; i++) {
            const posX = pos.x + i;
            for (let j = 0; j < height; j++) {
                const posY = pos.y + j;
                this.setTile({x: posX, y: posY}, sprite, type);
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        for (const tile of this.tiles.values()) {
            const pos: Vector = { x: tile.pos.x * this.tileSize, y: tile.pos.y * this.tileSize } 
            tile.spriteSheet.draw(ctx, 1, 1, pos, this.tileSize, false);
        }
    }
}