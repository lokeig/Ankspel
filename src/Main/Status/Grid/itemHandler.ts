import { SpriteSheet } from "../Common/sprite";
import { Vector } from "../Common/types";
import { Item } from "../DynamicObjects/Items/item";
import { Shotgun } from "../DynamicObjects/Items/weapon";
import { CollisionObject, StaticObject } from "../StaticObjects/staticObject";
import { TileHandler } from "./tileHandler";


export class ItemHandler {

    private static items: Map<string, Set<Item>> = new Map();
    private static gridSize: number;

    static init(gridSize: number) {
        this.gridSize = gridSize;
    }

    public static update(deltaTime: number) {
        const movedItems: Map<string, Set<Item>> = new Map();

        for (const [key, itemSet] of this.items.entries()) {
            for (const item of itemSet) {

                if (item.shouldBeDeleted()) {
                    itemSet.delete(item);
                    continue;
                }

                this.setNearby(item);
                item.update(deltaTime);

                const newKey = this.key(this.getGridPos(item.dynamicObject.pos));

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

    public static draw() {
        for (const itemArray of this.items.values()) {

            for (const item of itemArray) {
                
                if (!item.owned) {
                    item.draw();
                }            
            }
        }
    }

    private static getGridPos(pos: Vector): Vector {
        return { x: Math.floor(pos.x / this.gridSize), y: Math.floor(pos.y / this.gridSize) }
    }

    private static getWorldPos(gridPos: Vector): Vector {
        return { x: gridPos.x * this.gridSize, y: gridPos.y * this.gridSize } 
    }

    private static key(pos: Vector): string {
        return `${pos.x},${pos.y}`;
    }

    public static getItems(pos: Vector): Set<Item> | undefined{
        return this.items.get(this.key(pos));
    }
    

    private static setNearby(item: Item): void {
        const nearbyCollidable: CollisionObject[] = [];
    
        const body = item.dynamicObject;
        const startX = body.pos.x - this.gridSize * 2;
        const endX = body.pos.x + body.width + this.gridSize * 2;
        const startY = body.pos.y - this.gridSize * 2;
        const endY = body.pos.y + body.height + this.gridSize * 2;
    
        for (let x = startX; x < endX; x += this.gridSize) {
            for (let y = startY; y < endY; y += this.gridSize) {
                const gridPos = this.getGridPos({ x, y });
    
                this.processTile(TileHandler.getTile(gridPos), nearbyCollidable);
                this.processItems(item, this.getItems(gridPos), nearbyCollidable);
            }
        }
    
        body.collidableObjects = nearbyCollidable;
    }

    private static processTile(tile: StaticObject | undefined, accumulatedCollidable: Array<CollisionObject>): void {
        if (!tile) return;
    
        accumulatedCollidable.push({ gameObject: tile, platform: tile.platform });
    
        if (tile.lipLeft) {
            accumulatedCollidable.push({ gameObject: tile.lipLeft, platform: true });
        }
    
        if (tile.lipRight) {
            accumulatedCollidable.push({ gameObject: tile.lipRight, platform: true });
        }
    }

    private static processItems(comparingItem: Item, itemArray: Set<Item> | undefined,  accumulatedCollidable: Array<CollisionObject>): void {
        if (!itemArray) return;
    
        for (const item of itemArray.values()) {
            if (item.collidable && item !== comparingItem) {
                accumulatedCollidable.push({ gameObject: item.dynamicObject, platform: true });
            } 
        }
    }

    static addShotgun(gridPos: Vector, imgSrc: string) {

        const itemSet = this.getItems(gridPos);

        const item = new Shotgun(this.getWorldPos(gridPos), new SpriteSheet(imgSrc, 32));
        item.dynamicObject.pos.y += item.dynamicObject.height;
        item.dynamicObject.pos.x += (item.dynamicObject.width - this.gridSize) / 2;

        if (!itemSet) {
            this.items.set(this.key(gridPos), new Set());
        } 

        this.getItems(gridPos)!.add(item);
    }
}