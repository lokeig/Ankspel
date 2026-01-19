import { DynamicObject } from "@core";
import { PlayerControls } from "./playerControls";
import { PlayerEquipment } from "./playerEquipment";
import { InputMode, ThrowType, Utility, ItemInteraction, EquipmentSlot } from "@common";
import { Connection, GameMessage, GameMessageMap } from "@server";
import { IItem, ItemManager, OnItemUseEffect, OnItemUseType } from "@item";

class PlayerItemManager {
    private playerBody: DynamicObject;
    private controls: PlayerControls;
    private equipment: PlayerEquipment;
    private nearbyItems: Array<IItem> = [];
    private lastHeldItem: IItem | null = null;
    public forcedThrowType: null | ThrowType = null;
    private id: number;

    constructor(body: DynamicObject, controls: PlayerControls, equipment: PlayerEquipment, id: number) {
        this.playerBody = body;
        this.controls = controls;
        this.equipment = equipment;
        this.id = id;
    }

    public handle() {
        this.nearbyItems = ItemManager.getNearby(this.playerBody.pos, this.playerBody.width, this.playerBody.height);
        if (this.controls.pickup(InputMode.Press)) {
            this.handlePickupOrThrow();
        }
        if (!this.equipment.hasItem(EquipmentSlot.Hand)) {
            return;
        }
        const item = this.equipment.getItem(EquipmentSlot.Hand);
        this.handleInteractions(item);
    }

    private handlePickupOrThrow(): void {
        if (this.equipment.hasItem(EquipmentSlot.Hand)) { // Throw item
            const item = this.equipment.getItem(EquipmentSlot.Hand)
            const throwType = this.getThrowType();
            Connection.get().sendGameMessage(GameMessage.ThrowItem, {
                itemID: ItemManager.getItemID(item)!,
                pos: { x: item.getBody().pos.x, y: item.getBody().pos.y },
                direction: item.getBody().direction,
                throwType
            });
            this.equipment.throw(EquipmentSlot.Hand, throwType);
        } else {  // Pickup item
            const nextItem = this.getNearbyItem();
            if (nextItem) {
                this.equipment.equip(nextItem, EquipmentSlot.Hand);
            }
        }
        this.sendMessage();
    }

    private sendMessage(): void {
        const equipmentMap: [keyof GameMessageMap[GameMessage.PlayerEquipment], EquipmentSlot][] = [
            ["holding", EquipmentSlot.Hand],
            ["head", EquipmentSlot.Head],
            ["body", EquipmentSlot.Body],
            ["boots", EquipmentSlot.Boots],
        ]
        const message: GameMessageMap[GameMessage.PlayerEquipment] = { id: this.id, holding: null, head: null, body: null, boots: null };
        equipmentMap.forEach(([type, slot]) => {
            if (this.equipment.hasItem(slot)) {
                message[type] = ItemManager.getItemID(this.equipment.getItem(slot))!;
            }
        });
        Connection.get().sendGameMessage(GameMessage.PlayerEquipment, message);
    }

    private handleInteractions(item: IItem): void {
        const interactions: [() => boolean, ItemInteraction][] = [
            [() => this.controls.shoot(InputMode.Press), ItemInteraction.Activate],
            [() => this.controls.up(InputMode.Press), ItemInteraction.Up],
            [() => this.controls.down(InputMode.Press), ItemInteraction.Down],
            [() => this.controls.left(InputMode.Press), ItemInteraction.Left],
            [() => this.controls.right(InputMode.Press), ItemInteraction.Right],
        ];
        interactions.forEach(([input, action]) => {
            if (!input()) {
                return;
            }
            const onInputFunction = item.interactions.get(action);
            if (!onInputFunction) {
                return;
            }
            const seed = Utility.Random.getRandomSeed();
            const local = true;
            this.handleEffects(item, onInputFunction(seed, local));

            const position = { x: item.getBody().pos.x, y: item.getBody().pos.y };
            const angle = item.getAngle();
            const direction = item.getBody().direction;
            const id = ItemManager.getItemID(item)!;

            Connection.get().sendGameMessage(GameMessage.ActivateItem, { id, position, angle, action, direction, seed });
            this.sendMessage();
        });
    }

    private handleEffects(item: IItem, effects: OnItemUseEffect[]) {
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
                case (OnItemUseType.Equip): {
                    this.equipment.equip(null, EquipmentSlot.Hand);
                    this.equipment.equip(item, effect.value);
                    break;
                }
            }
        })
    }

    private getNearbyItem(): IItem | null {
        let fallbackItem: IItem | null = null;
        for (const item of this.nearbyItems) {
            if (!this.playerBody.collision(item.getBody().scale(30, 30))) {
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
            return ThrowType.Drop;
        }
        if (left || right) {
            if (up) {
                return ThrowType.HardDiagonal;
            }
            return ThrowType.Hard;
        }
        if (up) {
            return ThrowType.Upwards;
        }
        return ThrowType.Light;
    }
}

export { PlayerItemManager };