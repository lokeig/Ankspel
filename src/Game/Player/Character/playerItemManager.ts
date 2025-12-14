import { IItem, ItemManager, ItemType, IFirearm, IExplosive } from "@game/Item";
import { DynamicObject } from "@core";
import { PlayerControls } from "./playerControls";
import { PlayerEquipment } from "./playerEquipment";
import { InputMode, ThrowType, Vector } from "@common";
import { GameServer, GMsgType } from "@server";

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
        this.
        this.nearbyItems = ItemManager.getNearby(this.playerCharacter.pos, this.playerCharacter.width, this.playerCharacter.height);
        if (this.controls.pickup(InputMode.Press)) {
            if (this.equipment.isHolding()) {
                this.throw(this.getThrowType());
            } else {
                const nextItem = this.getNearbyItem();
                if (nextItem) {
                    this.equipment.setHolding(nextItem);
                }
            }
        }

        if (this.equipment.isHolding() && this.controls.shoot(InputMode.Press)) {
            const item = this.equipment.getHolding();
            switch (item.common.getType()) {
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

        const item = this.equipment.getHolding();
        this.equipment.setHolding(null);
        item.common.body.grounded = false;
        item.common.throw(throwType);

        GameServer.get().sendMessage(GMsgType.throwItem, { 
            itemID: ItemManager.getItemID(item)!,
            pos: { x: item.common.body.pos.x, y: item.common.body.pos.y },
            throwType
        });
    }
}

export { PlayerItemManager };