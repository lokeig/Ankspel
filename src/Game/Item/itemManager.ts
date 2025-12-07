import { Grid, Vector } from "@common";
import { ItemConstructor, IItem } from "./IItem";

class ItemManager {
    private static items: Map<string, Set<IItem>> = new Map();
    private static IDToItem: Map<number, IItem> = new Map();
    private static ItemToID: Map<IItem, number> = new Map();

    private static register: Map<string, ItemConstructor> = new Map();
    private static itemIndex = 0;

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
        Grid.updateMapPositions<IItem>(this.items, e => e.common.body.pos);
    }

    public static registerItem(type: string, constructor: ItemConstructor): void {
        this.register.set(type, constructor);
    }

    public static create(type: string, pos: Vector): IItem | null {
        const constructor = this.register.get(type);
        if (!constructor) {
            return null;
        }
        const result = new constructor(pos);
        this.addItem(result);
        this.setItemID(result, this.itemIndex++);
        return result;
    }

    public static spawn(type: string, pos: Vector, id: number): void {
        const constructor = this.register.get(type);
        if (!constructor) {
            return;
        }
        const newItem = new constructor(pos);
        this.addItem(newItem);
        this.setItemID(newItem, id);
    }

    private static setItemID(item: IItem, id: number) {
        this.ItemToID.set(item, id);
        this.IDToItem.set(id, item);
    }

    public static getItems(pos: Vector): Set<IItem> | undefined {
        return this.items.get(Grid.key(pos));
    }

    public static getNearby(pos: Vector, width: number, height: number): IItem[] {
        const result: IItem[] = [];

        const startX = pos.x - Grid.size * 2;
        const endX = pos.x + width + Grid.size * 2;
        const startY = pos.y - Grid.size * 2;
        const endY = pos.y + height + Grid.size * 2;

        for (let x = startX; x < endX; x += Grid.size) {
            for (let y = startY; y < endY; y += Grid.size) {
                const gridPos = Grid.getGridPos(new Vector(x, y));
                this.processItemArray(gridPos, result);
            }
        }
        return result;
    }

    private static processItemArray(gridPos: Vector, accumulatedItems: Array<IItem>): void {
        const itemArray = this.getItems(gridPos);
        if (!itemArray) {
            return;
        }
        for (const item of itemArray.values()) {
            accumulatedItems.push(item);
        }
    }

    private static addItem(item: IItem) {
        const gridPos = item.common.body.pos;
        const itemSet = this.getItems(gridPos);
        if (!itemSet) {
            this.items.set(Grid.key(gridPos), new Set());
        }
        this.getItems(gridPos)!.add(item);
    }

    public static getItemFromID(id: number): IItem | undefined {
        return this.IDToItem.get(id);
    }

    public static getItemID(item: IItem): number | undefined {
        return this.ItemToID.get(item);
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