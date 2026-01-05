import { Side, Utility, Vector } from "@common";
import { IItem } from "@item";

class PlayerEquipment {
    private helmet!: IItem;
    private armor!: IItem;
    private boots!: IItem;
    private holding: IItem | null = null;

    public isHolding(): boolean {
        return this.holding !== null;
    }

    public getHolding(): IItem {
        return this.holding!;
    }

    public setHolding(item: IItem | null): void {
        if (!item && this.holding) {
            this.holding.setOwnership(false);
        }
        this.holding = item;
        if (item) {
            this.holding!.setOwnership(true);
        }
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