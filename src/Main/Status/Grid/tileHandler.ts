import { SpriteSheet } from "../Common/sprite";
import { Vector, Direction, getReverseDirection, Neighbours } from "../Common/types";
import { StaticObject } from "../StaticObjects/staticObject";
import { tileType, Tile } from "../StaticObjects/tile";


export class TileHandler {

    public static gridSize: number;
    private static tiles = new Map<string, StaticObject>();

    static init(gridSize: number) {
        this.gridSize = gridSize;
    }

    static getWorldPos(gridPos: Vector): Vector {
        return { x: gridPos.x * this.gridSize, y: gridPos.y * this.gridSize } 
    }

    static key(pos: Vector): string {
        return `${pos.x},${pos.y}`;
    }

    static getTile(pos: Vector): StaticObject | undefined{
        return this.tiles.get(this.key(pos));
    }
    
    static setTile(gridPos: Vector, sprite: SpriteSheet, type: tileType) {
        const size = this.gridSize;
        const pos = this.getWorldPos(gridPos);
        const value = new Tile(pos, sprite, type, size, size, size);
        this.tiles.set(this.key(gridPos), value);

        value.neighbours = this.getNeighbours(gridPos);
        value.update();

        for (const [key, _] of Object.entries(value.neighbours) as [Direction, boolean][]) {
            const neighbourTile = this.shift(gridPos, key);
            const tile = this.getTile(neighbourTile);

            if (!tile) {
                continue;
            }
            
            tile.setNeighbour(getReverseDirection(key), true)
        }
    }

   static shift(gridPos: Vector, direction: Direction): Vector {
        switch (direction) {
            case "left":     return  { x: gridPos.x - 1, y: gridPos.y };
            case "right":    return  { x: gridPos.x + 1, y: gridPos.y };
            case "top":      return  { x: gridPos.x, y: gridPos.y - 1 };
            case "bot":      return  { x: gridPos.x, y: gridPos.y + 1 };
            case "topLeft":  return  { x: gridPos.x - 1, y: gridPos.y - 1 };
            case "topRight": return  { x: gridPos.x + 1, y: gridPos.y - 1 };
            case "botLeft":  return  { x: gridPos.x - 1, y: gridPos.y + 1 };
            case "botRight": return  { x: gridPos.x + 1, y: gridPos.y + 1 };
        }
    }

    static getNeighbours(gridPos: Vector): Neighbours {
        const tile = this.getTile(gridPos);
        const neighbours: Neighbours = { 
            left: false, right: false, top: false, bot: false, 
            topLeft: false, topRight: false, botRight: false, botLeft: false 
        }
        if (!tile) {
            return neighbours;
        }
       
        for (const [key, _] of Object.entries(neighbours) as [Direction, boolean][]) {
            if (tile.tileEqual(this.getTile(this.shift(gridPos, key)))) {
                neighbours[key] = true;
            }
        }
        return neighbours;
    }

    static draw() {
        for (const tile of this.tiles.values()) {
            tile.draw();
        }
    }
}