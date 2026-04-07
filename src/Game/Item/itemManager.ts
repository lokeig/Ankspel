import { Grid, Utility, } from "@common";
import { ItemConstructor, IItem, isItem } from "./IItem";
import { IDManager } from "@game/Common/IDManager/idManager";
import { Connection, GameMessage } from "@server";
import { Ownership } from "./ItemPlayerUse/itemUseType";
import { Vector } from "@math";

class ItemManager {
    private static items: Map<string, Set<IItem>> = new Map();
    private static register: Map<string, ItemConstructor> = new Map();

    private static idManager = new IDManager;
    private static permanent: IItem[] = [];

    public static clear(): void {
        this.items.forEach(itemset => itemset.forEach(item => item.setToDelete()));
        this.items = new Map();
        this.permanent.forEach(item => this.addToMap(item));
        this.idManager.reset();
    }

    public static update(deltaTime: number) {
        this.items.forEach(itemSet => itemSet.forEach(item => {
            if (item.shouldBeDeleted()) {
                itemSet.delete(item);
                Connection.get().sendGameMessage(GameMessage.DeleteItem, { id: item.info.id });
                this.idManager.removeObject(item)!;
            } else {
                item.update(deltaTime);
            }
        }));
        Grid.updateMapPositions<IItem>(this.items, e => e.body.pos);
    }

    public static registerItem(type: string, constructor: ItemConstructor): void {
        this.register.set(type, constructor);
    }

    public static create(type: string, gridPos: Vector, noMessage: boolean = false): IItem | null {
        const constructor = this.register.get(type);
        if (!constructor) {
            return null;
        }
        const id = this.idManager.getNextID();

        const newItem = new constructor(Grid.getWorldPos(gridPos), id);
        newItem.body.pos.x += (Grid.size - newItem.body.width) / 2;
        newItem.body.pos.y -= newItem.body.height;

        this.addToMap(newItem);
        this.idManager.add(newItem);

        if (!noMessage) {
            Connection.get().sendGameMessage(GameMessage.SpawnItem, { type, id, pos: Utility.Vector.convertToNetwork(gridPos) });
        }

        return newItem;
    }

    public static spawn(type: string, gridPos: Vector, id: number): IItem | null {
        const constructor = this.register.get(type);
        if (!constructor) {
            return null;
        }
        const newItem = new constructor(Grid.getWorldPos(gridPos), id);
        newItem.body.pos.x += (Grid.size - newItem.body.width) / 2;
        newItem.body.pos.y -= newItem.body.height;

        this.addToMap(newItem);
        this.idManager.setID(newItem, id);
        return newItem;
    }

    private static getItems(pos: Vector): Set<IItem> | undefined {
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
                if (item.enabled() && item.ownership === Ownership.None) {
                    result.push(item);
                }
            });
        }

        Grid.forNearby(pos, nextPos, width, height, accumulate);
        return result;
    }

    private static addToMap(item: IItem) {
        const gridPos = item.body.pos;
        const itemSet = this.getItems(gridPos);
        if (!itemSet) {
            this.items.set(Grid.key(gridPos), new Set());
        }
        this.getItems(gridPos)!.add(item);
    }

    public static addPermanent(item: IItem, id: number): void {
        this.idManager.setPermanentID(item, id);
        this.permanent.push(item);
    }

    public static getItemFromID(id: number): IItem | undefined {
        const obj = this.idManager.getObject(id);
        if (isItem(obj)) {
            return obj;
        }
    }

    public static draw() {
        this.items.forEach(itemSet => itemSet.forEach(item => {
            if (item.enabled() && item.ownership === Ownership.None) {
                item.draw();
            }
        }));
    }
}

export { ItemManager };