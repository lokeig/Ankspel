import { Grid, Utility, Vector } from "@common";
import { ItemConstructor, IItem } from "./IItem";
import { IDManager } from "@game/Common/IDManager/idManager";
import { Connection, GameMessage } from "@server";

class ItemManager {
    private static items: Map<string, Set<IItem>> = new Map();
    private static register: Map<string, ItemConstructor> = new Map();
    private static idManager = new IDManager<IItem>();
    private static itemIndex = 0;

    public static update(deltaTime: number) {
        this.items.forEach(itemSet => itemSet.forEach(item => {
            if (item.shouldBeDeleted()) {
                itemSet.delete(item);
                const id = this.idManager.removeObject(item)!;
                Connection.get().sendGameMessage(GameMessage.deleteItem, { id });
            } else {
                item.update(deltaTime);
            }
        }));
        Grid.updateMapPositions<IItem>(this.items, e => e.getBody().pos);
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
        this.idManager.setID(result, this.itemIndex++);
        return result;
    }

    public static spawn(type: string, pos: Vector, id: number): void {
        const constructor = this.register.get(type);
        if (!constructor) {
            return;
        }
        const newItem = new constructor(pos);
        this.addItem(newItem);
        this.idManager.setID(newItem, id);
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
        const gridPos = item.getBody().pos;
        const itemSet = this.getItems(gridPos);
        if (!itemSet) {
            this.items.set(Grid.key(gridPos), new Set());
        }
        this.getItems(gridPos)!.add(item);
    }

    public static activateItem(item: IItem, action: number): number {
        const seed = Utility.Random.getRandomSeed();
        const id = this.idManager.getID(item)!;
        Connection.get().sendGameMessage(GameMessage.activateItem, { id, action, angle: item.getAngle(), seed });
        return seed;
    }

    public static getItemFromID(id: number): IItem | undefined {
        return this.idManager.getObject(id);
    }

    public static getItemID(item: IItem): number | undefined {
        return this.idManager.getID(item);
    }

    public static draw() {
        this.items.forEach(itemSet => itemSet.forEach(item => {
            if (!item.isOwned()) {
                item.draw();
            }
        }));
    }
}

export { ItemManager };