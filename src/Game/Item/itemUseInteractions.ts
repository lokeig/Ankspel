import { ItemInteraction, PlayerAnim, PlayerState } from "@common";
import { ItemUseHandler } from "./itemUseHandler";
import { OnItemUseEffect } from "./itemUseType";

class ItemUseInteractions {
    private interactions: Map<ItemInteraction, ItemUseHandler> = new Map();
    private onPlayerAnim: ((anim: PlayerAnim) => void) | undefined;
    private onPlayerState: ((state: PlayerState) => OnItemUseEffect[]) | undefined;

    public get(interaction: ItemInteraction): ItemUseHandler | undefined {
        return this.interactions.get(interaction);
    }

    public set(interaction: ItemInteraction, onUse: ItemUseHandler): void {
        this.interactions.set(interaction, onUse);
    }

    public setOnPlayerAnimation(onAnim: (anim: PlayerAnim) => void): void {
        this.onPlayerAnim = onAnim;
    }

    public getOnPlayerAnimation(): ((anim: PlayerAnim) => void) | undefined {
        return this.onPlayerAnim;
    }

    public setOnPlayerState(onState: (state: PlayerState) => OnItemUseEffect[]): void {
        this.onPlayerState = onState;
    }

    public getOnPlayerState(): ((state: PlayerState) => OnItemUseEffect[]) | undefined {
        return this.onPlayerState;
    }
}

export { ItemUseInteractions };