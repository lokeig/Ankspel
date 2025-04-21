import { Vector } from "./types";
import { Tile } from "./tile";


type Pos = {
    x: number,
    y: number
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

    setCell(pos: Vector, value: Tile) {
        this.tiles.set(this.key(pos), value);
    }

    getCell(pos: Vector): Cell {
        return this.cells.get(this.key(pos)) || "EMPTY";
    }

    isBlock(pos: Vector): boolean {
        return this.getCell(pos) === "BLOCK";
    }
}