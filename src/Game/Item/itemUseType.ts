import { Vector } from "@common";

enum OnItemUseType {
    Knockback,
    Position,
    Aim,
}

interface OnItemUseMap {
    [OnItemUseType.Knockback]: Vector ,
    [OnItemUseType.Position]: Vector ,
    [OnItemUseType.Aim]: number,
}

type OnItemUseEffect = {
    [K in OnItemUseType]: {
        type: K;
        value: OnItemUseMap[K];
    }
}[OnItemUseType];

export { OnItemUseType };
export type { OnItemUseMap, OnItemUseEffect };