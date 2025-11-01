import { Controls, Input } from "@common";
import { ItemInterface, ItemManager, ItemType, FirearmInterface, ExplosiveInterface } from "@game/Item";
import { DynamicObject } from "@core";
import { ThrowType } from "./throwType";

class PlayerItemHolder {
    private playerCharacter: DynamicObject;
    public holding: ItemInterface | null = null;
    public nearbyItems: Array<ItemInterface> = [];
    public forcedThrowType: null | ThrowType = null;
    private lastHeldItem: ItemInterface | null = null;

    constructor(object: DynamicObject) {
        this.playerCharacter = object;
    }

    public update(deltaTime: number, controls: Controls) {
        this.nearbyItems = ItemManager.getNearby(this.playerCharacter.pos, this.playerCharacter.width, this.playerCharacter.height);

        if (Input.keyPress(controls.pickup)) {
            if (this.holding) {
                this.throw(this.getThrowType(controls));
            } else {
                this.holding = this.getNearbyItem();
            }
        }

        if (this.holding && Input.keyPress(controls.shoot)) {
            switch (this.holding.common.getType()) {
                case (ItemType.fireArm): {
                    const knockback = (this.holding as FirearmInterface).shoot();
                    this.playerCharacter.velocity.x -= knockback.x;
                    this.playerCharacter.velocity.y -= knockback.y;
                    break;
                }

                case (ItemType.explosive): {
                    (this.holding as ExplosiveInterface).activate();
                    break;
                }
            }
        }
    }
    
    private getNearbyItem(): ItemInterface | null {
        let fallbackItem: ItemInterface | null = null;
        
        for (const item of this.nearbyItems.values()) {
            if (!this.playerCharacter.collision(item.common.getPickupHitbox())) {
                continue
            } 
            
            if (item === this.lastHeldItem) {
                fallbackItem = this.lastHeldItem;
                continue;
            }
            
            item.common.owned = true;
            this.lastHeldItem = item;
            return item;
        }
        
        if (fallbackItem) {
            fallbackItem.common.owned = true;
            this.lastHeldItem = fallbackItem;
        }
        return fallbackItem;
    }

    private getThrowType(controls: Controls): ThrowType {
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

    public throw(throwType: ThrowType) {
        if (!this.holding) {
            return;
        }

        const itemLogic = this.holding.common;
        this.holding = null;
        itemLogic.body.grounded = false;
        itemLogic.owned = false;
        const direcMult = itemLogic.body.getDirectionMultiplier();
        
        switch (throwType) {
            case(ThrowType.light): {
                itemLogic.body.velocity = { x: 3.5 * direcMult, y: -3.5 };
                itemLogic.rotateSpeed = 10;
                break;
            }
            case(ThrowType.hard): {
                itemLogic.body.velocity = { x: 15 * direcMult, y: -5 };
                itemLogic.rotateSpeed = 15;
                break;
            }
            case(ThrowType.hardDiagonal): {
                itemLogic.body.velocity = { x: 15 * direcMult, y: -10 };
                itemLogic.rotateSpeed = 15;
                break;
            }
            case(ThrowType.drop): {
                itemLogic.body.velocity = { x: 0 * direcMult, y: 0 };
                itemLogic.rotateSpeed = 5;
                break;
            }
            case(ThrowType.upwards): {
                itemLogic.body.velocity = { x: 0 * direcMult, y: -10 };
                itemLogic.rotateSpeed = 8;
                break;
            }
        }
    }
}

export { PlayerItemHolder };