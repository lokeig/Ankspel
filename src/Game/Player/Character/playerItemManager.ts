import { IItem, ItemManager, ItemType, IFirearm, IExplosive } from "@game/Item";
import { DynamicObject } from "@core";
import { ThrowType } from "./throwType";
import { PlayerControls } from "./playerControls";
import { PlayerEquipment } from "./playerEquipment";

class PlayerItemManager {
    private playerCharacter: DynamicObject;
    private controls: PlayerControls;
    private equipment: PlayerEquipment;
    private nearbyItems: Array<IItem> = [];
    private lastHeldItem: IItem | null = null;
    public forcedThrowType: null | ThrowType = null;

    constructor(object: DynamicObject, controls: PlayerControls, equipment: PlayerEquipment) {
        this.playerCharacter = object;
        this.controls = controls;
        this.equipment = equipment;
    }

    public update(deltaTime: number) {
        this.nearbyItems = ItemManager.getNearby(this.playerCharacter.pos, this.playerCharacter.width, this.playerCharacter.height);
<<<<<<< HEAD:src/Game/Player/Character/playerItemHolder.ts
        if (this.controls.pickup()) {
            if (this.holding) {
=======
        const press = true;
        if (this.controls.pickup(press)) {
            if (this.equipment.isHolding()) {
>>>>>>> 8d7c288f463b044635f0d6e387eb9b539c948159:src/Game/Player/Character/playerItemManager.ts
                this.throw(this.getThrowType());
            } else {
                const nextItem = this.getNearbyItem();
                if (nextItem) {
                    this.equipment.setHolding(nextItem);
                }
            }
        }

<<<<<<< HEAD:src/Game/Player/Character/playerItemHolder.ts
        if (this.holding && this.controls.shoot()) {
            switch (this.holding.common.getType()) {
=======
        if (this.equipment.isHolding() && this.controls.shoot(press)) {
            const item = this.equipment.getHolding();
            switch (item.common.getType()) {
>>>>>>> 8d7c288f463b044635f0d6e387eb9b539c948159:src/Game/Player/Character/playerItemManager.ts
                case (ItemType.fireArm): {
                    const knockback = (item as IFirearm).shoot();
                    this.playerCharacter.velocity.x -= knockback.x;
                    this.playerCharacter.velocity.y -= knockback.y;
                    break;
                }

                case (ItemType.explosive): {
                    (item as IExplosive).activate();
                    break;
                }
            }
        }
    }

    private getNearbyItem(): IItem | null {
        let fallbackItem: IItem | null = null;

        for (const item of this.nearbyItems.values()) {
            if (!this.playerCharacter.collision(item.common.getPickupHitbox())) {
                continue
            }

            if (item === this.lastHeldItem) {
                fallbackItem = this.lastHeldItem;
                continue;
            }

            this.lastHeldItem = item;
            return item;
        }

        if (fallbackItem) {
            this.lastHeldItem = fallbackItem;
        }
        return fallbackItem;
    }

    private getThrowType(): ThrowType {
        if (this.forcedThrowType !== null) {
            return this.forcedThrowType;
        }
        const left = this.controls.left();
        const right = this.controls.right();
        const up = this.controls.up();

        if (this.controls.down()) {
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
        if (!this.equipment.isHolding()) {
            return;
        }

        const itemLogic = this.equipment.getHolding().common;
        this.equipment.setHolding(null);
        itemLogic.body.grounded = false;
        const direcMult = itemLogic.body.getDirectionMultiplier();

        switch (throwType) {
            case (ThrowType.light): {
                itemLogic.body.velocity = { x: 3.5 * direcMult, y: -3.5 };
                itemLogic.rotateSpeed = 10;
                break;
            }
            case (ThrowType.hard): {
                itemLogic.body.velocity = { x: 15 * direcMult, y: -5 };
                itemLogic.rotateSpeed = 15;
                break;
            }
            case (ThrowType.hardDiagonal): {
                itemLogic.body.velocity = { x: 15 * direcMult, y: -10 };
                itemLogic.rotateSpeed = 15;
                break;
            }
            case (ThrowType.drop): {
                itemLogic.body.velocity = { x: 0 * direcMult, y: 0 };
                itemLogic.rotateSpeed = 5;
                break;
            }
            case (ThrowType.upwards): {
                itemLogic.body.velocity = { x: 0 * direcMult, y: -10 };
                itemLogic.rotateSpeed = 8;
                break;
            }
        }
    }
}

export { PlayerItemManager };