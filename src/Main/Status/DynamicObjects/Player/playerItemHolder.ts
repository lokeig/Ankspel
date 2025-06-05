import { Input } from "../../Common/input";
import { Controls, Vector, Direction } from "../../Common/types";
import { DynamicObject } from "../Common/dynamicObject";
import { Item, ThrowType } from "../Items/item";

export class PlayerItemHolder {
    holding: Item | null = null;

    public update(deltaTime: number, playerObject: DynamicObject, controls: Controls) {

        // Pickup or throw item
        if (Input.keyPress(controls.pickup)) {
            if (!this.holding) {
                this.holding = playerObject.getNearbyItem();
            } else {
                this.holding.throw(this.getThrowType(controls));
                this.holding = null;
            }
        }

        // Interact with item
        if (this.holding && Input.keyPress(controls.shoot)) {
            this.holding.interact(deltaTime, playerObject);
        }

        // Update holding item position
        if (this.holding) {
            this.holding.pos = playerObject.getCenter();
            this.holding.pos.y -= this.holding.height / 2
            this.holding.direction = playerObject.direction;
            if (playerObject.direction === "left") {
                this.holding.pos.x -= this.holding.width;
            }
        }
    }

    public getThrowType(controls: Controls): ThrowType {
        const left = Input.keyDown(controls.left);
        const right = Input.keyDown(controls.right);
        const up = Input.keyDown(controls.up);

        if (Input.keyDown(controls.down)) {
            return ThrowType.drop;
        }

        if (left || right) {
            if (up) {
                return ThrowType.hardDiagonal;
            }
            return ThrowType.hard;
        }

        if (up) {
            return ThrowType.upwards;
        }

        return ThrowType.light;
    }

    public setHoldingPosition(pos: Vector, direction: Direction): void {
        if (!this.holding) {
            return
        }
        this.holding.pos.x = direction === "right" ? pos.x : pos.x - this.holding.width;
        this.holding.pos.y = pos.y;
        

        this.holding.direction = direction;
    }
}