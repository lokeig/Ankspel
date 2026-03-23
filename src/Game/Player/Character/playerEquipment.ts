import { Vector } from "@math";
import { EquipmentSlot, PlayerAnim, Side, ThrowType, Utility } from "@common";
import { IItem, isEquippable, ItemManager, Ownership } from "@item";
import { Connection, GameMessage } from "@server";

class PlayerEquipment {
    private equipment: Map<EquipmentSlot, IItem | undefined> = new Map();

    public hasItem(slot: EquipmentSlot): boolean {
        return this.equipment.get(slot) !== undefined;
    }

    public getItem(slot: EquipmentSlot): IItem {
        return this.equipment.get(slot)!;
    }

    public equip(item: IItem | null, slot: EquipmentSlot): void {
        const current = this.equipment.get(slot);

        if (current) {
            if (isEquippable(current) && current.getOwnership() === Ownership.Equipped) {
                current.onUnequip();
            }
            current.setOwnership(Ownership.None);
        }
        if (!item) {
            this.equipment.set(slot, undefined);
            return;
        }
        this.equipment.set(slot, item);

        const ownership = (slot === EquipmentSlot.Hand) ? Ownership.Held : Ownership.Equipped;

        item.setOwnership(ownership);
        if (isEquippable(item) && slot !== EquipmentSlot.Hand) {
            item.onEquip();
        }
    }

    public unequipAll(): void {
        this.equipment.forEach((_, slot) => {
            this.equip(null, slot);
        })
    }


    public throw(slot: EquipmentSlot, throwType: ThrowType) {
        if (!this.hasItem(slot)) {
            return;
        }
        const item = this.getItem(slot);

        item.throw(throwType);
        if (isEquippable(item) && item.getOwnership() === Ownership.Equipped) {
            item.onUnequip();
        }
        item.setOwnership(Ownership.None);

        Connection.get().sendGameMessage(GameMessage.ThrowItem, {
            id: ItemManager.getItemID(item)!,
            pos: { x: item.getBody().pos.x, y: item.getBody().pos.y },
            direction: item.getBody().direction,
            throwType
        });

        this.equipment.set(slot, undefined);
    }

    public setBody(center: Vector, offset: Vector, direction: Side, angle: number, slot: EquipmentSlot) {
        if (!this.hasItem(slot)) {
            return;
        }
        const item = this.getItem(slot);
        item.getBody().setCenterToPos(center);
        item.getBody().direction = direction;
        item.setAngle(angle);

        const angledOffset = Utility.Angle.rotateForce(offset, angle);
        item.getBody().pos.x += angledOffset.x * item.getBody().getDirectionMultiplier();
        item.getBody().pos.y += angledOffset.y;
    }

    public getAllEquippedItems(): Map<EquipmentSlot, IItem | undefined> {
        return this.equipment;
    }

    public itemNoRotationCollision(center: Vector, offset: Vector): boolean {
        if (!this.hasItem(EquipmentSlot.Hand)) {
            return false;
        }
        const item = this.getItem(EquipmentSlot.Hand);
        const itemBody = item.getBody();
        let holdOffset = item.getHoldOffset();

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