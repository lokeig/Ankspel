import { GameObject } from "./gameobject";
import { SpriteSheet } from "./sprite";
import { Vector, vectorMul } from "./types";

type tileType = "GRASS" | "ICE" | "STONE"

export class Tile extends GameObject {
    type: tileType;

    constructor(pos: Vector, width: number, height: number, sprite: SpriteSheet, type: tileType, drawSize: number){
        super(pos, width, height, sprite, drawSize);

        this.type = type;
    }

    getType(): string {
        return this.type;
    }

    update(){
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.sprite.draw(ctx, 1, 1, this.pos, this.drawSize, false);
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

    getGridPos(pos: Vector): Vector {
        return { x: Math.floor(pos.x / this.tileSize), y: Math.floor(pos.y / this.tileSize) }
    }

    getWorldPos(gridPos: Vector): Vector {
        return { x: gridPos.x * this.tileSize, y: gridPos.y * this.tileSize } 
    }

    snap(pos: Vector): Vector {
        return this.getWorldPos(this.getGridPos(pos));
    }

    getNearbyTiles(object: GameObject): Tile[] {
            return [];
    }

    isBlock(pos: Vector): boolean {
        return this.tiles.get(this.key(pos)) !== undefined
    }
    setTile(gridPos: Vector, sprite: SpriteSheet, type: tileType) {
        const size = this.tileSize;

        const pos = this.getWorldPos(gridPos);
        const value = new Tile(pos, size, size, sprite, type, size)

        this.tiles.set(this.key(gridPos), value);
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
            tile.draw(ctx);
        }
    }
}