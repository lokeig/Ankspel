import { Grid, Vector } from "@common";
import { ItemConstructor, IItem } from "./IItem";
import { IDManager } from "@game/Common/IDManager/idManager";
import { Connection, GameMessage } from "@server";
import { Ownership } from "./itemUseType";

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
                Connection.get().sendGameMessage(GameMessage.DeleteItem, { id });
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

    public static getNearby(pos: Vector, width: number, height: number, nextPos: Vector = pos): IItem[] {
        const result: IItem[] = [];
        const accumulate = (gridPos: Vector) => {
            const itemSet = this.getItems(gridPos);
            if (!itemSet) {
                return;
            }
            itemSet.forEach(item => {
                if (item.getOwnership() === Ownership.None) {
                    result.push(item);
                }
            });
        }
        
        Grid.forNearby(pos, nextPos, width, height, accumulate);
        return result;
    }

    private static processItemArray(gridPos: Vector, result: Array<IItem>): void {
        const itemSet = this.getItems(gridPos);
        if (!itemSet) {
            return;
        }
        itemSet.forEach(item => {
            if (item.getOwnership() === Ownership.None) {
                result.push(item);
            }
        });
    }

    private static addItem(item: IItem) {
        const gridPos = item.getBody().pos;
        const itemSet = this.getItems(gridPos);
        if (!itemSet) {
            this.items.set(Grid.key(gridPos), new Set());
        }
        this.getItems(gridPos)!.add(item);
    }

    public static getItemFromID(id: number): IItem | undefined {
        return this.idManager.getObject(id);
    }

    public static getItemID(item: IItem): number | undefined {
        return this.idManager.getID(item);
    }

    public static draw() {
        this.items.forEach(itemSet => itemSet.forEach(item => {
            if (item.getOwnership() === Ownership.None) {
                item.draw();
            }
        }));
    }
}

export { ItemManager };