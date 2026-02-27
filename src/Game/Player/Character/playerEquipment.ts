import { Vector } from "@math";
import { EquipmentSlot, PlayerAnim, Side, ThrowType, Utility } from "@common";
import { IItem, Ownership } from "@item";

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
            current.onUnequip?.();
            current.setOwnership(Ownership.None);
        }
        if (!item) {
            this.equipment.set(slot, undefined);
            return;
        }
        this.equipment.set(slot, item);

        const ownership = (slot === EquipmentSlot.Hand) ? Ownership.Held : Ownership.Equipped;

        item.setOwnership(ownership);
        item.onEquip?.(slot);
    }

    public unequipAll(): void {
        this.equipment.forEach((_, slot) => {
            this.equip(null, slot);
        })
    }

    public setAnimation(anim: PlayerAnim): void {
        this.equipment.forEach((_, slot) => {
            if (this.hasItem(slot)) {
                this.getItem(slot).interactions().getOnPlayerAnimation(anim);
            }
        })
    }

    public throw(slot: EquipmentSlot, throwType: ThrowType) {
        if (!this.hasItem(slot)) {
            return;
        }
        const item = this.getItem(slot);

        item.onUnequip?.();
        item.throw(throwType);
        item.setOwnership(Ownership.None);

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

    public itemNoRotationCollision(center: Vector): boolean {
        if (!this.hasItem(EquipmentSlot.Hand)) {
            return false;
        }
        const item = this.getItem(EquipmentSlot.Hand);
        const tempItemPos = item.getBody().pos.clone();

        item.getBody().setCenterToPos(center);
        item.getBody().pos.x += item.getHoldOffset().x * item.getBody().getDirectionMultiplier();
        item.getBody().pos.y += item.getHoldOffset().y;

        const collision = item.getBody().getCollidingTile();

        item.getBody().pos = tempItemPos;

        return collision !== undefined;
    }
}

export { PlayerEquipment };