import { ItemInteraction, PlayerAnim } from "@common";
import { ItemUseHandler } from "./itemUseHandler";

class ItemUseInteractions {
    private interactions: Map<ItemInteraction, ItemUseHandler> = new Map();
    private onPlayerAnim: ((anim: PlayerAnim) => void) | undefined;

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
}

export { ItemUseInteractions };