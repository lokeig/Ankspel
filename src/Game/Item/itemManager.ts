import { Grid, Vector } from "@common";
import { ItemInterface } from "./itemInterface";

class ItemManager {

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

        Grid.updateMapPositions<ItemInterface>(this.items, e => e.common.body.pos);
    }
    
    public static getItems(pos: Vector): Set<ItemInterface> | undefined{
        return this.items.get(Grid.key(pos));
    }

    public static getNearby(pos: Vector, width: number, height: number): ItemInterface[] {
        const result: ItemInterface[] = [];
        
        const startX = pos.x - Grid.size * 2;
        const endX = pos.x + width + Grid.size * 2;
        const startY = pos.y - Grid.size * 2;
        const endY = pos.y + height + Grid.size * 2;
    
        for (let x = startX; x < endX; x += Grid.size) {
            for (let y = startY; y < endY; y += Grid.size) {
                const gridPos = Grid.getGridPos({ x, y });
                
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
    
    public static addItem(item: ItemInterface) {
        const gridPos = item.common.body.pos;
        const itemSet = this.getItems(gridPos);
        
        if (!itemSet) {
            this.items.set(Grid.key(gridPos), new Set());
        }
        
        this.getItems(gridPos)!.add(item);
    }

    public static draw() {
        for (const itemSet of this.items.values()) {
            for (const item of itemSet) {
                if (!item.common.owned) {
                    item.draw();
                }            
            }
        }
    }
}

export { ItemManager };