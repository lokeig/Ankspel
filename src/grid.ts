import { GameObject } from "./gameobject";
import { SpriteSheet } from "./sprite";
import { GridObject, Tile, tileType } from "./tile";
import { Direction, Neighbours, Vector } from "./types";

export class Grid {
    static tileSize: number;
    static tiles: Map<string, GridObject>

    static init(size: number) {
        this.tileSize = size;
        this.tiles = new Map<string, GridObject>();
    }

    static getGridPos(pos: Vector): Vector {
        return { x: Math.floor(pos.x / this.tileSize), y: Math.floor(pos.y / this.tileSize) }
    }

    static getWorldPos(gridPos: Vector): Vector {
        return { x: gridPos.x * this.tileSize, y: gridPos.y * this.tileSize } 
    }

    static shift(gridPos: Vector, direction: Direction): Vector {
        if (direction === "left")     return  { x: gridPos.x - 1, y: gridPos.y };
        if (direction === "right")    return  { x: gridPos.x + 1, y: gridPos.y };
        if (direction === "top")      return  { x: gridPos.x, y: gridPos.y - 1 };
        if (direction === "bot")      return  { x: gridPos.x, y: gridPos.y + 1 };
        if (direction === "topLeft")  return  { x: gridPos.x - 1, y: gridPos.y - 1 };
        if (direction === "topRight") return  { x: gridPos.x + 1, y: gridPos.y - 1 }
        if (direction === "botLeft")  return  { x: gridPos.x - 1, y: gridPos.y + 1 };
                                      return  { x: gridPos.x + 1, y: gridPos.y + 1 }
    }


    static snap(obj: GameObject, direction: Direction): Vector {

        const BR = { x: obj.pos.x + obj.width, y: obj.pos.y + obj.height }

        const TLGrid = this.getGridPos(obj.pos);
        const BRGrid = this.getGridPos(BR);

        if (direction === "left") {
            const snappedPos = this.getWorldPos(this.shift(TLGrid, "right"));
            return {x: snappedPos.x, y: obj.pos.y}
        }
        if (direction === "right") {
            const snappedPos = this.getWorldPos(this.shift(BRGrid, "left"));
            return {x: snappedPos.x + (Grid.tileSize - obj.width), y: obj.pos.y}
        }
        if (direction === "top") {
            const snappedPos = this.getWorldPos(this.shift(TLGrid, "bot"));
            return { x: obj.pos.x, y: snappedPos.y }
        }
        if (direction === "bot") {
            const snappedPos = this.getWorldPos(this.shift(BRGrid, "top"));
            return { x: obj.pos.x, y: snappedPos.y + (Grid.tileSize - obj.height) }        
        }
        return obj.pos;
        
    }

    static getNearbyTiles(gameobject: GameObject): Array<GridObject> {        
        const nearbyTiles: Array<GridObject> = []
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

    static getCell(pos: Vector): GridObject | undefined{
        return this.tiles.get(this.key(pos));
    }
    
    static setTile(gridPos: Vector, sprite: SpriteSheet, type: tileType) {
        const size = this.tileSize;
        const pos = this.getWorldPos(gridPos);
        const value = new Tile(pos, sprite, type, size);
        this.tiles.set(this.key(gridPos), value);

        value.neighbours = this.getNeighbours(gridPos);
        value.update();

        for (const [key, hasNeighbour] of Object.entries(value.neighbours) as [Direction, boolean][]) {
            const tile = this.getCell(this.shift(this.getGridPos(value.pos), key));
            if (!tile) continue;

            if (key === "left"     && hasNeighbour) tile.setNeighbour("right", true)
            if (key === "right"    && hasNeighbour) tile.setNeighbour("left", true)
            if (key === "top"      && hasNeighbour) tile.setNeighbour("bot", true)
            if (key === "bot"      && hasNeighbour) tile.setNeighbour("top", true)
            if (key === "topLeft"  && hasNeighbour) tile.setNeighbour("botRight", true)
            if (key === "topRight" && hasNeighbour) tile.setNeighbour("botLeft", true)
            if (key === "botLeft"  && hasNeighbour) tile.setNeighbour("topRight", true)
            if (key === "botRight" && hasNeighbour) tile.setNeighbour("topLeft", true)
        }
    }

    static getNeighbours(gridPos: Vector): Neighbours {
        const tile = this.getCell(gridPos);

        const neighbours: Neighbours = { left: false, right: false, top: false, bot: false, topLeft: false, topRight: false, botRight: false, botLeft: false }
        if (!tile) return neighbours;
       
        for (const [key, _] of Object.entries(neighbours) as [Direction, boolean][]) {
            if (tile.tileEqual(this.getCell(this.shift(gridPos, key)))) neighbours[key] = true;
        }
        return neighbours;
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