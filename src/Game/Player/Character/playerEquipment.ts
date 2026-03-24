import { Vector } from "@math";
import { EquipmentSlot, Side, ThrowType, Utility } from "@common";
import { Equippable, IItem, isEquippable, ItemManager, Ownership } from "@item";
import { Connection, GameMessage } from "@server";
import { DynamicObject } from "@core";

class PlayerEquipment {
    private equipment: Map<EquipmentSlot, IItem | undefined> = new Map();
    private body: () => DynamicObject;

    constructor(body: () => DynamicObject) {
        this.body = body;
    }

    public hasItem(slot: EquipmentSlot): boolean {
        return this.equipment.get(slot) !== undefined;
    }

    public getItem(slot: EquipmentSlot): IItem {
        return this.equipment.get(slot)!;
    }

    public equip(item: IItem | null, slot: EquipmentSlot): void {
        const current = this.equipment.get(slot);

        if (current) {
            if (current.ownership === Ownership.Equipped) {
                (current as Equippable).onUnequip();
            }
            current.ownership = Ownership.None;
        }
        if (!item) {
            this.equipment.set(slot, undefined);
            return;
        }
        this.equipment.set(slot, item);

        const ownership = (slot === EquipmentSlot.Hand) ? Ownership.Held : Ownership.Equipped;
        item.ownership = ownership;

        if (isEquippable(item) && slot !== EquipmentSlot.Hand) {
            item.onEquip();
        }
    }

    public unequipAll(): void {
        this.equipment.forEach((_, slot) => {
            this.equip(null, slot);
        })
    }

    public getWeight(): number {
        let result = 1;
        this.equipment.forEach(item => {
            if (item) {
                result *= item.info.weightFactor;
            }
        })
        return result;
    }

    public throw(slot: EquipmentSlot, throwType: ThrowType) {
        if (!this.hasItem(slot)) {
            return;
        }

        const item = this.getItem(slot);

        item.ignoring.set(this.body(), 0.1);

        item.throw(throwType);
        if (item.ownership === Ownership.Equipped) {
            (item as Equippable).onUnequip();
        }
        item.ownership = Ownership.None;

        Connection.get().sendGameMessage(GameMessage.ThrowItem, {
            id: ItemManager.getItemID(item)!,
            pos: { x: item.body.pos.x, y: item.body.pos.y },
            direction: item.body.direction,
            throwType
        });

        this.equipment.set(slot, undefined);
    }

    public setBody(center: Vector, offset: Vector, direction: Side, angle: number, slot: EquipmentSlot) {
        if (!this.hasItem(slot)) {
            return;
        }
        const item = this.getItem(slot);
        item.body.setCenterToPos(center);
        item.body.direction = direction;
        item.setAngle(angle);

        const angledOffset = Utility.Angle.rotateForce(offset, angle);
        item.body.pos.x += angledOffset.x * item.body.getDirectionMultiplier();
        item.body.pos.y += angledOffset.y;
    }

    public getAllEquippedItems(): Map<EquipmentSlot, IItem | undefined> {
        return this.equipment;
    }

    public itemNoRotationCollision(center: Vector, offset: Vector): boolean {
        if (!this.hasItem(EquipmentSlot.Hand)) {
            return false;
        }
        const item = this.getItem(EquipmentSlot.Hand);
        const itemBody = item.body;
        let holdOffset = item.info.holdOffset;

        holdOffset = holdOffset.clone().subtract(offset);

        const tempItemPos = itemBody.pos.clone();

        itemBody.setCenterToPos(center);
        itemBody.pos.x += holdOffset.x * itemBody.getDirectionMultiplier();
        itemBody.pos.y += holdOffset.y;

        const collision = itemBody.getCollidingTile();

        itemBody.pos = tempItemPos;

        return collision !== undefined;
    }
}

export { PlayerEquipment };