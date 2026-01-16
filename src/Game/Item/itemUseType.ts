import { EquipmentSlot, Vector } from "@common";

enum OnItemUseType {
    Knockback,
    Position,
    Aim,
    Equip
}

enum Ownership {
    Held,
    Equipped,
    None
}

interface OnItemUseMap {
    [OnItemUseType.Knockback]: Vector ,
    [OnItemUseType.Position]: Vector ,
    [OnItemUseType.Aim]: number,
    [OnItemUseType.Equip]: EquipmentSlot
}

type OnItemUseEffect = {
    [K in OnItemUseType]: {
        type: K;
        value: OnItemUseMap[K];
    }
}[OnItemUseType];

export { OnItemUseType, EquipmentSlot, Ownership };
export type { OnItemUseMap, OnItemUseEffect };