import { Side, Utility, Vector } from "@common";
import { EquipmentSlot, IItem } from "@item";

class PlayerEquipment {
    private equipment: Map<EquipmentSlot, IItem | undefined> = new Map();

    public isHolding(): boolean {
        return this.equipment.get(EquipmentSlot.Hand) !== undefined;
    }

    public getHolding(): IItem {
        return this.equipment.get(EquipmentSlot.Hand)!;
    }

    public setHolding(item: IItem | null): void {
        if (!item && this.isHolding()) {
            this.getHolding().setOwnership(false);
        }
        if (!item) {
            this.equipment.set(EquipmentSlot.Hand, undefined);
            return;
        }
        this.equipment.set(EquipmentSlot.Hand, item);
        this.getHolding().setOwnership(true);
    }

    public equip(slot: EquipmentSlot, item: IItem) {
        this.equipment.set(slot, item);
    }

    public unequip(slot: EquipmentSlot): IItem | null {
        const result = this.equipment.get(slot);
        if (!result) {
            return null;
        }
        this.equipment.delete(slot);
        return result;
    }

    public setHoldingBody(center: Vector, direction: Side, angle: number) {
        if (!this.isHolding()) {
            return;
        }
        const item = this.getHolding();
        item.getBody().setCenterToPos(center);
        item.getBody().direction = direction;
        item.setWorldAngle(angle);

        const offset = Utility.Angle.rotateForce(item.getHoldOffset(), angle + item.getLocalAngle());
        item.getBody().pos.x += offset.x * item.getBody().getDirectionMultiplier();
        item.getBody().pos.y += offset.y;
    }

    public itemNoRotationCollision(center: Vector): boolean {
        if (!this.isHolding()) {
            return false;
        }
        const item = this.getHolding();
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