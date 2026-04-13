import { DynamicObject } from "@core";
import { Ownership } from "../ItemPlayerUse/itemUseType";
import { ItemAngleHelper } from "./itemAngleHelper";

class ItemPhysics {
    private body: DynamicObject;
    private itemAngle: ItemAngleHelper;

    constructor(body: DynamicObject, angle: ItemAngleHelper) {
        this.body = body;
        this.itemAngle = angle;
    }

    public update(deltaTime: number, ownership: Ownership): void {
        if (ownership === Ownership.None) {
            this.updateItemPhysics(deltaTime);
            if (Math.abs(this.body.velocity.x) > 50) {
                this.body.frictionMultiplier = 1;
            } else {
                this.body.frictionMultiplier = 2;
            }
        } else {
            this.body.setNewCollidableObjects();
        }
        this.body.onSideCollision = () => this.itemAngle.rotateSpeed *= 0.5;
    }

    private updateItemPhysics(deltaTime: number) {
        this.body.friction = this.body.grounded ? 5 : 1;

        this.itemAngle.updateAngle(deltaTime, this.body.grounded);
        this.body.update(deltaTime);
    }
}

export { ItemPhysics };