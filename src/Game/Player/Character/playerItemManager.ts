import { DynamicObject } from "@core";
import { PlayerControls } from "./playerControls";
import { PlayerEquipment } from "./playerEquipment";
import { InputMode, ThrowType, Utility, ItemInteraction, EquipmentSlot } from "@common";
import { Connection, GameMessage, GameMessageMap } from "@server";
import { IItem, OnItemUseEffect, OnItemUseType, Ownership } from "@item";
import { AudioManager, Sound } from "@game/Audio";

class PlayerItemManager {
    private playerBody: () => DynamicObject;
    private controls: PlayerControls;
    private equipment: PlayerEquipment;
    private lastHeldItem: IItem | null = null;
    private id: number;

    public enabled: boolean = true;
    public forcedThrowType: null | ThrowType = null;

    constructor(body: () => DynamicObject, controls: PlayerControls, equipment: PlayerEquipment, id: number) {
        this.playerBody = body;
        this.controls = controls;
        this.equipment = equipment;
        this.id = id;
    }

    public handle(nearby: IItem[]): void {
        if (!this.controls.pickup(InputMode.Press) || !this.enabled) {
            return;
        }
        if (this.equipment.hasItem(EquipmentSlot.Hand)) { // Throw item
            const throwType = this.getThrowType();
            this.equipment.throw(EquipmentSlot.Hand, throwType);

            this.sendEquipmentMessage();
        } else {  // Pickup item
            const nextItem = this.getNearbyItem(nearby);
            if (nextItem) {
                this.equipment.equip(nextItem, EquipmentSlot.Hand);
                this.sendEquipmentMessage();
            }
        }
    }

    private sendEquipmentMessage(): void {
        const equipmentMap: [keyof GameMessageMap[GameMessage.PlayerEquipment], EquipmentSlot][] = [
            ["holding", EquipmentSlot.Hand],
            ["head", EquipmentSlot.Head],
            ["body", EquipmentSlot.Body],
            ["boots", EquipmentSlot.Boots],
        ]
        const message: GameMessageMap[GameMessage.PlayerEquipment] = { id: this.id, holding: null, head: null, body: null, boots: null };
        equipmentMap.forEach(([type, slot]) => {
            if (this.equipment.hasItem(slot)) {
                message[type] = this.equipment.getItem(slot).info.id;
            }
        });
        Connection.get().sendGameMessage(GameMessage.PlayerEquipment, message);
    }

    public handleInteractions(): void {
        if (!this.equipment.hasItem(EquipmentSlot.Hand)) {
            return;
        }
        const item = this.equipment.getItem(EquipmentSlot.Hand);
        const inputInteractions: [() => boolean, ItemInteraction][] = [
            [() => this.controls.shoot(InputMode.Press), ItemInteraction.Activate],
            [() => this.controls.up(InputMode.Press), ItemInteraction.Up],
            [() => this.controls.down(InputMode.Press), ItemInteraction.Down],
            [() => this.controls.left(InputMode.Press), ItemInteraction.Left],
            [() => this.controls.right(InputMode.Press), ItemInteraction.Right],
        ];
        inputInteractions.forEach(([input, action]) => {
            if (input()) {
                this.triggerInteraction(item, action);
            }
        });
    }

    private triggerInteraction(item: IItem, action: ItemInteraction): void {
        const onInputFunction = item.playerInteractions.getUse(action);
        if (!onInputFunction) {
            return;
        }

        const seed = Utility.Random.seed();
        const local = true;

        this.handleEffects(item, onInputFunction(seed, local));

        const pos = Utility.Vector.convertToNetwork(item.body.pos);
        const angle = item.getAngle();
        const direction = item.body.direction;
        const id = item.info.id;

        Connection.get().sendGameMessage(GameMessage.ActivateItem, { id, pos, angle, action, direction, seed });

        this.sendEquipmentMessage();
    }

    public handleEffects(item: IItem, effects: OnItemUseEffect[]) {
        effects.forEach((effect) => {
            switch (effect.type) {
                case (OnItemUseType.Aim): {
                    break;
                }
                case (OnItemUseType.Knockback): {
                    this.playerBody().velocity.subtract(effect.value);
                    break;
                }
                case (OnItemUseType.Position): {
                    this.playerBody().pos = effect.value;
                    break;
                }
                case (OnItemUseType.Equip): {
                    this.equipment.equip(null, EquipmentSlot.Hand);
                    this.equipment.throw(effect.value, ThrowType.Light);
                    this.equipment.equip(item, effect.value);
                    AudioManager.get().play(Sound.equip);
                    break;
                }
                case (OnItemUseType.Unequip): {
                    this.equipment.throw(effect.value, ThrowType.Drop);
                    break;
                }
                case (OnItemUseType.Throw): {
                    this.equipment.throw(effect.value, this.getThrowType());
                    break;
                }
            }
        })
    }

    private getNearbyItem(nearby: IItem[]): IItem | null {
        let fallbackItem: IItem | null = null;
        for (const item of nearby) {
            if (!this.playerBody().collision(item.body.scale(30, 30))) {
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