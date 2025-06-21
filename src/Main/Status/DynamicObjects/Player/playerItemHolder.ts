import { Input } from "../../Common/input";
import { Controls } from "../../Common/types";
import { DynamicObject } from "../Common/dynamicObject";
import { ItemInterface, ItemLogic, ItemType, ThrowType } from "../Items/item";

export class PlayerItemHolder {
    public holding: ItemInterface | null = null;
    public nearbyItems: Array<ItemInterface> = [];
    private lastHeldItem: ItemInterface | null = null;
    public forcedThrowType: null | ThrowType = null;

    public update(deltaTime: number, playerObject: DynamicObject, controls: Controls) {

        // Pickup or throw item
        if (Input.keyPress(controls.pickup)) {
            if (!this.holding) {
                this.holding = this.getNearbyItem(playerObject);
            } else {
                this.throw(this.getThrowType(controls), this.holding.itemLogic);
            }
        }
        // Interact with item
        if (this.holding && Input.keyPress(controls.shoot)) {
            this.holding.interact();
            switch (this.holding.itemLogic.getType()) {
                case (ItemType.fireArm): {
                    const knockback = this.holding.itemLogic.getFirearmInfo().getKnockback(this.holding.itemLogic.angle, this.holding.itemLogic.isFlip());
                    playerObject.velocity.x -= knockback.x;
                    playerObject.velocity.y -= knockback.y;
                    break;
                }
                case (ItemType.explosive): {

                }
            }
        }
    }
    
    public getNearbyItem(playerObject: DynamicObject): ItemInterface | null {
        let fallbackItem: ItemInterface | null = null;
        
        for (const item of this.nearbyItems.values()) {
            if (!playerObject.collision(item.itemLogic.getPickupHitbox())) {
                continue
            } 
            
            if (item === this.lastHeldItem) {
                fallbackItem = this.lastHeldItem;
                continue;
            }
            
            item.itemLogic.owned = true;
            this.lastHeldItem = item;
            return item;
        }
        
        if (fallbackItem) {
            fallbackItem.itemLogic.owned = true;
            this.lastHeldItem = fallbackItem;
        }
        return fallbackItem;
    }

    public getThrowType(controls: Controls): ThrowType {
        if (this.forcedThrowType !== null) {
            return this.forcedThrowType;
        }
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

    public throw(throwType: ThrowType, itemLogic: ItemLogic) {
        this.holding = null;
        itemLogic.dynamicObject.grounded = false;
        itemLogic.owned = false;
        const direcMult = itemLogic.dynamicObject.getDirectionMultiplier();
        
        switch (throwType) {
            case(ThrowType.light): {
                itemLogic.dynamicObject.velocity = { x: 3.5 * direcMult, y: -3.5 };
                itemLogic.rotateSpeed = 10;
                break;
            }
            case(ThrowType.hard): {
                itemLogic.dynamicObject.velocity = { x: 15 * direcMult, y: -5 };
                itemLogic.rotateSpeed = 15;
                break;
            }
            case(ThrowType.hardDiagonal): {
                itemLogic.dynamicObject.velocity = { x: 15 * direcMult, y: -10 };
                itemLogic.rotateSpeed = 15;
                break;
            }
            case(ThrowType.drop): {
                itemLogic.dynamicObject.velocity = { x: 0 * direcMult, y: 0 };
                itemLogic.rotateSpeed = 5;
                break;
            }
            case(ThrowType.upwards): {
                itemLogic.dynamicObject.velocity = { x: 0 * direcMult, y: -10 };
                itemLogic.rotateSpeed = 8;
                break;
            }
        }
    }
}