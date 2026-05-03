import { Grid, } from "@common";
import { ItemConstructor, IItem, isItem } from "./IItem";
import { Connection, GameMessage } from "@server";
import { Ownership } from "./ItemPlayerUse/itemUseType";
import { Vector } from "@math";
import { GameObject } from "@core";

class ItemManager {
    private static items: Map<string, Set<IItem>> = new Map();
    private static register: Map<string, ItemConstructor> = new Map();
    private static idToItem: Map<number, IItem> = new Map();

    private static permanent: IItem[] = [];
    private static currentId = 1;

    public static clear(): void {
        this.items.forEach(itemset => itemset.forEach(item => item.setToDelete()));
        this.items.clear();
        this.idToItem.clear();
        this.permanent.forEach(item => {
            this.idToItem.set(item.info.id, item);
            this.addToMap(item)
        });
    }

    public static update(deltaTime: number) {
        this.items.forEach(itemSet => itemSet.forEach(item => {
            if (item.shouldBeDeleted()) {
                Connection.get().sendGameMessage(GameMessage.DeleteItem, { id: item.info.id });
                itemSet.delete(item);
                item.setToDelete();
                this.idToItem.delete(item.info.id);
            } else {
                item.update(deltaTime);
            }
        }));
        Grid.updateMapPositions<IItem>(this.items, e => e.body.pos);
    }

    public static registerItem(type: string, constructor: ItemConstructor): void {
        this.register.set(type, constructor);
    }

    public static getRegisteredNames(): string[] {
        return Array.from(this.register.keys());
    }

    public static getConstructor(type: string): ItemConstructor | undefined {
        return this.register.get(type);
    }

    public static createNewRaw(type: string, gridPos: Vector, id: number = -1): IItem | null {
        const constructor = this.register.get(type);
        if (!constructor) {
            return null;
        }
        const newItem = new constructor(Grid.getWorldPos(gridPos), id);
        newItem.body.pos.x += (Grid.size - newItem.body.width) / 2;
        newItem.body.pos.y += (Grid.size - newItem.body.height);
        return newItem;
    }

    public static create(type: string, gridPos: Vector): IItem | null {
        const newItem = this.createNewRaw(type, gridPos, this.currentId);
        if (!newItem) {
            return null;
        }
        this.currentId++;
        this.addToMap(newItem);
        this.idToItem.set(newItem.info.id, newItem);

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
        this.idToItem.set(id, newItem);
        return newItem;
    }

    private static getItems(pos: Vector): Set<IItem> | undefined {
        return this.items.get(Grid.key(pos));
    }

    public static getNearby(body: GameObject, nextPos: Vector = body.pos): IItem[] {
        const result: IItem[] = [];
        const accumulate = (gridPos: Vector): void => {
            const itemSet = this.getItems(gridPos);
            if (!itemSet) {
                return;
            }
            itemSet.forEach(item => {
                if (item.body === body) {
                    return;
                }
                if (item.enabled() && item.ownership === Ownership.None) {
                    result.push(item);
                }
            });
        }

        Grid.forNearby(body.pos, nextPos, body.width, body.height, accumulate);
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
        this.permanent.push(item);
    }

    public static getItemFromID(id: number): IItem | undefined {
        return this.idToItem.get(id);
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