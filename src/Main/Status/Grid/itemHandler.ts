import { Vector } from "../Common/types";
import { ItemInterface } from "../DynamicObjects/Items/itemLogic";
import { GridHelper } from "./gridHelper";

export class ItemHandler {

    private static items: Map<string, Set<ItemInterface>> = new Map();

    public static update(deltaTime: number) {
        for (const itemSet of this.items.values()) {
            for (const item of itemSet) {
                
                if (item.shouldBeDeleted()) {
                    itemSet.delete(item);
                    continue;
                }
                
                item.update(deltaTime);
            }
        }
        
        GridHelper.updateMapPositions<ItemInterface>(this.items, e => e.itemLogic.dynamicObject.pos);
    }
    

    
    public static getItems(pos: Vector): Set<ItemInterface> | undefined{
        return this.items.get(GridHelper.key(pos));
    }

    public static getNearby(pos: Vector, width: number, height: number): ItemInterface[] {
        const result: ItemInterface[] = [];
        
        const startX = pos.x - GridHelper.gridSize * 2;
        const endX = pos.x + width + GridHelper.gridSize * 2;
        const startY = pos.y - GridHelper.gridSize * 2;
        const endY = pos.y + height + GridHelper.gridSize * 2;
    
        for (let x = startX; x < endX; x += GridHelper.gridSize) {
            for (let y = startY; y < endY; y += GridHelper.gridSize) {
                const gridPos = GridHelper.getGridPos({ x, y });
                
                this.processItemArray(gridPos, result);
            }
        }
        
        return result;
    }
    
    private static processItemArray(gridPos: Vector, accumulatedItems: Array<ItemInterface>): void {
        const itemArray = this.getItems(gridPos);
        
        if (!itemArray) {
            return;
        }
        
        for (const item of itemArray.values()) {
            accumulatedItems.push(item);
        }
        
    }
    
    public static addItem(gridPos: Vector, itemClass: new (pos: Vector) => ItemInterface) {
        const itemSet = this.getItems(gridPos);
        
        const item = new itemClass(GridHelper.getWorldPos(gridPos));
        item.itemLogic.dynamicObject.pos.y += item.itemLogic.dynamicObject.height;
        item.itemLogic.dynamicObject.pos.x += (item.itemLogic.dynamicObject.width - GridHelper.gridSize) / 2;
        
        if (!itemSet) {
            this.items.set(GridHelper.key(gridPos), new Set());
        }
        
        this.getItems(gridPos)!.add(item);
    }

    public static draw() {
        for (const itemSet of this.items.values()) {
            for (const item of itemSet) {
                if (!item.itemLogic.owned) {
                    item.draw();
                }            
            }
        }
    }
}