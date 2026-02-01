import { ItemInteraction, PlayerAnim } from "@common";
import { ItemUseHandler } from "./itemUseHandler";

class ItemUseInteractions {
    private interactions: Map<ItemInteraction, ItemUseHandler> = new Map();
    private onPlayerAnim: Map<PlayerAnim, () => void> = new Map();

    public get(interaction: ItemInteraction): ItemUseHandler | undefined {
        return this.interactions.get(interaction);
    }

    public set(interaction: ItemInteraction, onUse: ItemUseHandler): void {
        this.interactions.set(interaction, onUse);
    }

    public setOnPlayerAnimation(anim: PlayerAnim, onAnim: () => void): void {
        this.onPlayerAnim.set(anim, onAnim);
    }

    public getOnPlayerAnimation(anim: PlayerAnim): (() => void) | undefined {
        return this.onPlayerAnim.get(anim);
    } 
}

export { ItemUseInteractions };