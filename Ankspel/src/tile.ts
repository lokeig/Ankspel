import { SpriteSheet } from "./sprite";
import { Vector } from "./types";

type tileType = "GRASS" | "ICE" | "STONE"

class Tile {
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

class Grid {
    gridSize: number;
    tiles: Map<string, Tile>;

    constructor(gridSize: number) {
        this.gridSize = gridSize;
        this.tiles = new Map();
    }

    private key(pos: Vector): string {
        return `${pos.x},${pos.y}`;
    }

    getCell(pos: Vector): Tile {

    }

    isBlock(pos: Vector): boolean {
        return this.tiles.get(this.key(pos)) !== undefined
    }

    setTile(pos: Vector, value: Tile) {
        this.tiles.set(this.key(pos), value);
    }
}