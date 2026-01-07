import { EquipmentSlot, OnItemUseEffect, OnItemUseType } from "@item";
import { Item } from "./item";
import { BodyParts, ItemInteraction, Vector } from "@common";

abstract class Armor extends Item {
    protected abstract slot: EquipmentSlot;
    private equipped: boolean = false;

    constructor(pos: Vector, width: number, height: number) {
        super(pos, width, height);
        this.interactions.set(ItemInteraction.Activate, () => {
            this.equipped = true;
            const result: OnItemUseEffect = {type: OnItemUseType.Equip, value: this.slot };
            return [result];
        });
        this.interactions.set(ItemInteraction.Hit () => { this })
    }

    protected abstract onHitFunction(seed: number, local: boolean): OnItemUseEffect[];



}
