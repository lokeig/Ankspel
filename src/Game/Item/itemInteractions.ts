import { ItemInteractionInput } from "@common";
import { OnItemUseEffect } from "./itemUseType";

type useFunction = (seed: number) => OnItemUseEffect[];

class ItemInteractions {
    private interactions: Map<ItemInteractionInput, useFunction> = new Map();

    public on(type: ItemInteractionInput, func: useFunction): void {
        this.interactions.set(type, func);
    }

    public get(type: ItemInteractionInput): useFunction | undefined {
        return this.interactions.get(type);
    }
}

export { ItemInteractions };
export type { useFunction };
