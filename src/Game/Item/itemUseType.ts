import { EquipmentSlot } from "@common";
import { Vector } from "@math";

enum OnItemUseType {
    Knockback,
    Position,
    Aim,
    Equip,
    Unequip
}

enum Ownership {
    Held,
    Equipped,
    None
}

interface OnItemUseMap {
    [OnItemUseType.Knockback]: Vector,
    [OnItemUseType.Position]: Vector,
    [OnItemUseType.Aim]: number,
    [OnItemUseType.Equip]: EquipmentSlot,
    [OnItemUseType.Unequip]: EquipmentSlot,
}

type OnItemUseEffect = {
    [K in OnItemUseType]: {
        type: K;
        value: OnItemUseMap[K];
    }
}[OnItemUseType];

export { OnItemUseType, EquipmentSlot, Ownership };
export type { OnItemUseMap, OnItemUseEffect };