import { SpriteSheet } from "../Common/sprite";
import { Vector } from "../Common/types";
import { Item } from "../DynamicObjects/Items/item";
import { Shotgun } from "../DynamicObjects/Items/weapon";
import { TileHandler } from "./tileHandler";


export class ItemHandler {

    private items: Map<string, Set<Item>> = new Map();
    private gridSize: number;

    constructor(gridSize: number) {
        this.gridSize = gridSize;
    }

    public update(deltaTime: number, tileHandler: TileHandler) {
        const movedItems: Map<string, Set<Item>> = new Map();

        for (const [key, itemSet] of this.items.entries()) {
            for (const item of itemSet) {

                if (item.shouldBeDeleted()) {
                    itemSet.delete(item);
                    continue;
                }

                this.setNearby(item, tileHandler);
                item.update(deltaTime);

                const newKey = this.key(this.getGridPos(item.pos));

                if (key !== newKey) {

                    itemSet.delete(item);

                    if (!movedItems.has(newKey)) {
                        movedItems.set(newKey, new Set());
                    }
                    movedItems.get(newKey)!.add(item);
                }
            }

            if (itemSet.size === 0) {
                this.items.delete(key);
            }
        }

        // Merges moved items into items Map
        for (const [newKey, itemSet] of movedItems.entries()) {
            if (!this.items.has(newKey)) {
                this.items.set(newKey, new Set());
            }
            for (const item of itemSet) {
                this.items.get(newKey)!.add(item);
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D) {
        for (const itemArray of this.items.values()) {

            for (const item of itemArray) {
                
                if (!item.owned) {
                    item.draw(ctx);
                }            
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

    getItems(pos: Vector): Set<Item> | undefined{
        return this.items.get(this.key(pos));
    }
    

    setNearby(item: Item, tileHandler: TileHandler): void {        
        const nearbyTiles = [];
        
        const gridOffset = this.gridSize * 2;
        let posX = item.pos.x - gridOffset;
        let posY = item.pos.y - gridOffset;

        while (posX < item.pos.x + item.width + gridOffset) {
            posY = item.pos.y - gridOffset;

            while (posY < item.pos.y + item.height + gridOffset) {

                const gridPos = this.getGridPos({ x: posX, y: posY });
                const tile = tileHandler.getTile(gridPos);

                posY += this.gridSize;

                if (!tile) {
                    continue;
                }

                nearbyTiles.push(tile)

                if (tile.lipLeft)  {
                    nearbyTiles.push(tile.lipLeft);
                }
                if (tile.lipRight) {
                    nearbyTiles.push(tile.lipRight);
                }
            }
            posX += this.gridSize;
        }
        item.nearbyTiles = nearbyTiles;
    }

    addItem(item: Item) {
        const gridPos = this.getGridPos(item.pos);
        const itemSet = this.getItems(gridPos);
        
        if (!itemSet) {
            const newSet: Set<Item> = new Set();
            newSet.add(item);
            this.items.set(this.key(gridPos), newSet);
        } else {
            itemSet.add(item);
        }
    }
    addShotgun(gridPos: Vector, imgSrc: string) {

        const itemSet = this.getItems(gridPos);

        const item = new Shotgun(this.getWorldPos(gridPos), new SpriteSheet(imgSrc, 32));
        item.pos.y += item.height;
        item.pos.x += (item.width - this.gridSize) / 2;

        if (!itemSet) {
            this.items.set(this.key(gridPos), new Set());
        } 

        this.getItems(gridPos)!.add(item);
    }
}