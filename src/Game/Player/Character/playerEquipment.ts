import { Side, ThrowType, Utility, Vector } from "@common";
import { EquipmentSlot, IItem, ItemManager, Ownership } from "@item";
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
        this.throw(slot, ThrowType.Drop);
        if (!item) {
            return;
        }
        this.equipment.set(slot, item);
        const ownership: Ownership = (slot === EquipmentSlot.Hand) ? Ownership.Held : Ownership.Equipped;
        this.getItem(slot).setOwnership(ownership);
    }

    public throw(slot: EquipmentSlot, throwType: ThrowType) {
        if (!this.hasItem(slot)) {
            return;
        }
        const item = this.getItem(slot);
        item.throw(throwType);
        item.setOwnership(Ownership.None);

        this.equipment.set(slot, undefined);

        Connection.get().sendGameMessage(GameMessage.ThrowItem, {
            itemID: ItemManager.getItemID(item)!,
            pos: { x: item.getBody().pos.x, y: item.getBody().pos.y },
            direction: item.getBody().direction,
            throwType
        });
    }


    public setBody(center: Vector, offset: Vector, direction: Side, angle: number, slot: EquipmentSlot) {
        if (!this.hasItem(slot)) {
            return;
        }
        const item = this.getItem(slot);
        item.getBody().setCenterToPos(center);
        item.getBody().direction = direction;
        item.setWorldAngle(angle);

        const angledOffset = Utility.Angle.rotateForce(offset, angle);
        item.getBody().pos.x += angledOffset.x * item.getBody().getDirectionMultiplier();
        item.getBody().pos.y += angledOffset.y;
    }

    public getAllEquippedItems(): Map<EquipmentSlot, IItem | undefined> {
        return this.equipment;
    }


    public itemNoRotationCollision(center: Vector): boolean {
        if (!this.hasItem(EquipmentSlot.Hand)) {
            return false;
        }
        const item = this.getItem(EquipmentSlot.Hand);
        const tempItemPos = item.getBody().pos.clone();

        item.getBody().setCenterToPos(center);
        item.getBody().pos.x += item.getHoldOffset().x * item.getBody().getDirectionMultiplier();
        item.getBody().pos.y += item.getHoldOffset().y;

        const collision = item.getBody().getHorizontalTileCollision();

        item.getBody().pos = tempItemPos;

        return collision !== undefined;
    }
}

export { PlayerEquipment };