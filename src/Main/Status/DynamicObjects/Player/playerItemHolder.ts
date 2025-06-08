import { Input } from "../../Common/input";
import { Controls, Vector, Direction } from "../../Common/types";
import { DynamicObject } from "../Common/dynamicObject";
import { Item, ThrowType } from "../Items/item";

export class PlayerItemHolder {
    public holding: Item | null = null;
    public nearbyItems: Array<Item> = [];
    private lastHeldItem: Item | null = null;

    public update(deltaTime: number, playerObject: DynamicObject, controls: Controls) {

        // Pickup or throw item
        if (Input.keyPress(controls.pickup)) {
            if (!this.holding) {
                this.holding = this.getNearbyItem(playerObject);
            } else {
                this.holding.throw(this.getThrowType(controls));
                this.holding = null;
            }
        }

        // Interact with item
        // if (this.holding && Input.keyPress(controls.shoot)) {
        //     this.holding.interact(deltaTime);
        // }

        this.setHoldingPosition(playerObject);
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

    public setHoldingPosition(playerObject: DynamicObject) {
        if (!this.holding) {
            return 
        }
        this.holding.dynamicObject.pos = playerObject.getCenter();
        this.holding.dynamicObject.pos.y -= this.holding.dynamicObject.height / 2
        this.holding.dynamicObject.direction = playerObject.direction;
        if (playerObject.direction === "left") {
            this.holding.dynamicObject.pos.x -= this.holding.dynamicObject.width;
        }
        
    }

    public getNearbyItem(playerObject: DynamicObject): Item | null {
        let fallbackItem: Item | null = null;

        for (const item of this.nearbyItems.values()) {
            if (!playerObject.collision(item.getIncreasedHitbox(3))) {
                continue
            } 
            
            if (item === this.lastHeldItem) {
                fallbackItem = this.lastHeldItem;
                continue;
            }

            item.owned = true;
            this.lastHeldItem = item;
            return item;
        }

        if (fallbackItem) {
            fallbackItem.owned = true;
            this.lastHeldItem = fallbackItem;
        }
        return fallbackItem;
    }
}