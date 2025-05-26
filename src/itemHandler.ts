import { Item } from "./item";
import { Vector } from "./types";

export class ItemHandler {

    private items: Map<string, Array<Item>> = new Map();
    private gridSize: number;

    constructor(gridSize: number) {
        this.gridSize = gridSize;
    }

    public update(deltaTime: number) {
        for (const itemArray of this.items.values()) {
            for (const item of itemArray) {
                item.update(deltaTime);
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D) {
        for (const itemArray of this.items.values()) {
            for (const item of itemArray) {
                item.draw(ctx);
            }
        }
    }


    getGridPos(pos: Vector): Vector {
        return { x: Math.floor(pos.x / this.gridSize), y: Math.floor(pos.y / this.gridSize) }
    }

    getWorldPos(gridPos: Vector): Vector {
        return { x: gridPos.x * this.gridSize, y: gridPos.y * this.gridSize } 
    }

    key(pos: Vector): string {
        return `${pos.x},${pos.y}`;
    }

    getItems(pos: Vector): Item[] | undefined{
        return this.items.get(this.key(pos));
    }

    addItem(item: Item) {
        const gridPos = this.getGridPos(item.pos);
        const itemArray = this.getItems(gridPos);
        if (!itemArray) {
            this.items.set(this.key(gridPos), [item]);
        } else {
            itemArray.push(item);
        }
    }
}