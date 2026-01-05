import { DynamicObject } from "@core";
import { PlayerControls } from "./playerControls";
import { PlayerEquipment } from "./playerEquipment";
import { InputMode, Side, ThrowType, Utility, Vector } from "@common";
import { Connection, GameMessage } from "@server";
import { IItem, ItemManager, OnItemUseEffect, OnItemUseType, useFunction } from "@item";

class PlayerItemManager {
    private playerBody: DynamicObject;
    private controls: PlayerControls;
    private equipment: PlayerEquipment;
    private nearbyItems: Array<IItem> = [];
    private lastHeldItem: IItem | null = null;
    public forcedThrowType: null | ThrowType = null;

    constructor(body: DynamicObject, controls: PlayerControls, equipment: PlayerEquipment) {
        this.playerBody = body;
        this.controls = controls;
        this.equipment = equipment;
    }

    public update(deltaTime: number) {
        this.nearbyItems = ItemManager.getNearby(this.playerBody.pos, this.playerBody.width, this.playerBody.height);
        if (this.controls.pickup(InputMode.Press)) {
            this.handlePickupOrThrow();
        }
        if (!this.equipment.isHolding()) {
            return;
        }
        const item = this.equipment.getHolding();
        this.handleInteractions(item, deltaTime);
    }

    private handlePickupOrThrow(): void {
        if (this.equipment.isHolding()) {
            this.throw(this.getThrowType());
        } else {
            const nextItem = this.getNearbyItem();
            if (nextItem) {
                this.equipment.setHolding(nextItem);
            }
        }
    }

    private handleInteractions(item: IItem, deltaTime: number): void {
        const interactions: [() => boolean, useFunction][] = [
            [() => this.controls.shoot(InputMode.Press), item.interactions.onActivate],
            [() => this.controls.up(InputMode.Press), item.interactions.onUp],
            [() => this.controls.down(InputMode.Press), item.interactions.onDown],
            [() => this.controls.left(InputMode.Press), item.interactions.onLeft],
            [() => this.controls.right(InputMode.Press), item.interactions.onRight],
        ];
        interactions.forEach(([input, onInputFunction]) => {
            if (!input()) {
                return;
            }
            const seed = Utility.Random.getRandomSeed();
            const effects = onInputFunction(deltaTime, seed);
            this.handleEffects(effects);
        });
    }

    private handleEffects(effects: OnItemUseEffect[]) {
        effects.forEach((effect) => {
            switch (effect.type) {
                case (OnItemUseType.Aim): {
                    break;
                }
                case (OnItemUseType.Knockback): {
                    this.playerBody.velocity.subtract(effect.value);
                    break;
                }
                case (OnItemUseType.Position): {
                    this.playerBody.pos = effect.value;
                    break;
                }
            }
        })
    }

    private getNearbyItem(): IItem | null {
        let fallbackItem: IItem | null = null;

        for (const item of this.nearbyItems.values()) {
            if (!this.playerBody.collision(item.getBody())) {
                continue;
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
        item.throw(throwType);

        Connection.get().sendGameMessage(GameMessage.throwItem, {
            itemID: ItemManager.getItemID(item)!,
            pos: { x: item.getBody().pos.x, y: item.getBody().pos.y },
            direction: item.getBody().direction,
            throwType
        });
    }

    public itemNoRotationCollision(center: Vector): boolean {
        if (!this.equipment.isHolding()) {
            return false;
        }
        const item = this.equipment.getHolding();
        const tempItemPos = item.getBody().pos.clone();

        item.getBody().setCenterToPos(center);
        item.getBody().pos.x += item.getHoldOffset().x * item.getBody().getDirectionMultiplier();
        item.getBody().pos.y += item.getHoldOffset().y;

        const collision = item.getBody().getHorizontalTileCollision();

        item.getBody().pos = tempItemPos;

        return collision !== undefined;
    }

    public setHoldingBody(center: Vector, direction: Side, angle: number) {
        if (!this.equipment.isHolding()) {
            return;
        }
        const item = this.equipment.getHolding();
        item.getBody().setCenterToPos(center);
        item.getBody().direction = direction;
        item.setWorldAngle(angle);

        const offset = Utility.Angle.rotateForce(item.getHoldOffset(), angle + item.getLocalAngle());
        item.getBody().pos.x += offset.x * item.getBody().getDirectionMultiplier();
        item.getBody().pos.y += offset.y;
    }

}

export { PlayerItemManager };