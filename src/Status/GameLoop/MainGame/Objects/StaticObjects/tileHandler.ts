import { StaticObject } from "./staticObject";
import { CollisionObject } from "./collisionObject";
import { Tile } from "./tile";
import { tileType } from "./tileType";
import { Grid } from "../../Common/grid";
import { SpriteSheet } from "../../Common/Sprite/sprite";
import { Direction } from "../../Common/Types/direction";
import { Neighbours } from "../../Common/Types/neighbours";
import { Vector } from "../../Common/Types/vector";
import { Utility } from "../../Common/Utility/utility";

export class TileHandler {

    private static tiles = new Map<string, StaticObject>();

    public static clear(): void {
        this.tiles = new Map;
    }

    public static getTile(gridPos: Vector): StaticObject | undefined {
        return this.tiles.get(Grid.key(gridPos));
    }

    public static setTile(gridPos: Vector, type: tileType) {
        const size = Grid.gridSize;
        const pos = Grid.getWorldPos(gridPos);
        const sprite = new SpriteSheet(`/assets/tile${tileType[type]}.png`, 16, 16);
        const value = new Tile(pos, sprite, type, size, size, size);
        this.tiles.set(Grid.key(gridPos), value);

        value.neighbours = this.getNeighbours(gridPos);
        value.update();

        for (const [key, _] of Object.entries(value.neighbours) as [Direction, boolean][]) {
            const neighbourTile = this.shift(gridPos, key);
            const tile = this.getTile(neighbourTile);

            if (!tile) {
                continue;
            }
            
            tile.setNeighbour(Utility.Direction.getReverseDirection(key), true)
        }
    }
    
    public static getNearbyTiles(pos: Vector, width: number, height: number): CollisionObject[] {
        const result: CollisionObject[] = [];
    
        const startX = pos.x - Grid.gridSize * 2;
        const endX = pos.x + width + Grid.gridSize * 2;
        const startY = pos.y - Grid.gridSize * 2;
        const endY = pos.y + height + Grid.gridSize * 2;
    
        for (let x = startX; x < endX; x += Grid.gridSize) {
            for (let y = startY; y < endY; y += Grid.gridSize) {
                const gridPos = Grid.getGridPos({ x, y });
    
                this.processTile(gridPos, result);
            }
        }

        return result;
    }
    
    private static processTile(gridPos: Vector, accumulatedCollidable: Array<CollisionObject>): void {
        
        const tile = this.getTile(gridPos);

        if (!tile) {
            return;
        }

        accumulatedCollidable.push({ gameObject: tile, platform: tile.platform });
    
        if (tile.lipLeft) {
            accumulatedCollidable.push({ gameObject: tile.lipLeft, platform: true });
        }
    
        if (tile.lipRight) {
            accumulatedCollidable.push({ gameObject: tile.lipRight, platform: true });
        }
    }


    private static shift(gridPos: Vector, direction: Direction): Vector {
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

    private static getNeighbours(gridPos: Vector): Neighbours {
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