import { Grid, Utility, Vector } from "@common";
import { ItemConstructor, IItem } from "./IItem";
import { IDManager } from "@game/Common/IDManager/idManager";
import { Connection, GameMessage } from "@server";
import { Ownership } from "./itemUseType";

class ItemManager {
    private static items: Map<string, Set<IItem>> = new Map();
    private static register: Map<string, ItemConstructor> = new Map();
    private static idManager = new IDManager<IItem>();
    private static permanent: Array<{ item: IItem; id: number }> = [];

    public static clear(): void {
        this.items = new Map();
        this.idManager.reset();

        for (const { item, id } of this.permanent) {
            this.addToMap(item);
            this.idManager.setID(item, id);
        }

        this.idManager.recalculateNextID();
    }


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

    public static create(type: string, gridPos: Vector): IItem | null {
        const constructor = this.register.get(type);
        if (!constructor) {
            return null;
        }
        const newItem = new constructor(Grid.getWorldPos(gridPos));
        newItem.getBody().pos.x += (Grid.size - newItem.getBody().width) / 2;
        newItem.getBody().pos.y -= newItem.getBody().height;

        this.addToMap(newItem);
        const id = this.idManager.add(newItem);

        Connection.get().sendGameMessage(GameMessage.SpawnItem, { type, id, pos: Utility.Vector.convertToNetwork(gridPos) });

        return newItem;
    }

    public static spawn(type: string, gridPos: Vector, id: number): void {
        const constructor = this.register.get(type);
        if (!constructor) {
            return;
        }
        const newItem = new constructor(Grid.getWorldPos(gridPos));
        newItem.getBody().pos.x += (Grid.size - newItem.getBody().width) / 2;
        newItem.getBody().pos.y -= newItem.getBody().height;

        this.addToMap(newItem);
        this.idManager.setID(newItem, id);
    }

    public static getItems(pos: Vector): Set<IItem> | undefined {
        return this.items.get(Grid.key(pos));
    }

    public static getNearby(pos: Vector, width: number, height: number, nextPos: Vector = pos): IItem[] {
        const result: IItem[] = [];
        const accumulate = (gridPos: Vector): void => {
            const itemSet = this.getItems(gridPos);
            if (!itemSet) {
                return;
            }
            itemSet.forEach(item => {
                if (item.enabled() && item.getOwnership() === Ownership.None) {
                    result.push(item);
                }
            });
        }

        Grid.forNearby(pos, nextPos, width, height, accumulate);
        return result;
    }

    private static addToMap(item: IItem) {
        const gridPos = item.getBody().pos;
        const itemSet = this.getItems(gridPos);
        if (!itemSet) {
            this.items.set(Grid.key(gridPos), new Set());
        }
        this.getItems(gridPos)!.add(item);
    }

    public static addPermanent(item: IItem, id: number): void {
        this.permanent.push({ item, id });
        this.addToMap(item);
        this.idManager.setID(item, id);
    }


    public static getItemFromID(id: number): IItem | undefined {
        return this.idManager.getObject(id);
    }

    public static getItemID(item: IItem): number | undefined {
        return this.idManager.getID(item);
    }

    public static draw() {
        this.items.forEach(itemSet => itemSet.forEach(item => {
            if (item.enabled() && item.getOwnership() === Ownership.None) {
                item.draw();
            }
        }));
    }
}

export { ItemManager };