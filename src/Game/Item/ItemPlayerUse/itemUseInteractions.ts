import { ItemInteraction, PlayerState } from "@common";
import { ItemUseHandler } from "./itemUseHandler";
import { OnItemUseEffect } from "./itemUseType";

class ItemPlayerInteraction {
    private useInteractions: Map<ItemInteraction, ItemUseHandler> = new Map();
    private onPlayerState: Map<PlayerState, (() => OnItemUseEffect[])> = new Map();

    public getUse(interaction: ItemInteraction): ItemUseHandler | undefined {
        return this.useInteractions.get(interaction);
    }

    public setUse(interaction: ItemInteraction, onUse: ItemUseHandler): void {
        this.useInteractions.set(interaction, onUse);
    }

    public setOnPlayerState(state: PlayerState, fn: () => OnItemUseEffect[]): void {
        this.onPlayerState.set(state, fn);
    }

    public getOnPlayerState(state: PlayerState): (() => OnItemUseEffect[]) | undefined {
        return this.onPlayerState.get(state);
    }

}

export { ItemPlayerInteraction };