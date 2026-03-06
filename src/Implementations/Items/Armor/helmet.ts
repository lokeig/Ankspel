import { Vector } from "@math";
import { OnItemUseEffect, OnItemUseType, Ownership } from "@item";
import { Item } from "../item";
import { EquipmentSlot, Frame, ItemInteraction, PlayerState, ProjectileEffect, ProjectileEffectType, SpriteSheet, Utility } from "@common";
import { ProjectileManager, ProjectileTarget } from "@projectile";
import { Images } from "@render";
import { Connection, GameMessage } from "@server";
import { AudioManager, Sound } from "@game/Audio";

class Helmet extends Item {
    private static frames = { default: new Frame(), broken: new Frame(), equipped: new Frame() };
    private static spriteSheet: SpriteSheet;

    private damaged: boolean = false;
    private target: ProjectileTarget;

    static {
        this.spriteSheet = new SpriteSheet(Images.armor);
        Utility.File.setFrames("helmet", this.frames);
    }

    constructor(pos: Vector, id: number) {
        const width = 32;
        const height = 32;
        super(pos, width, height, id);

        this.useInteractions.set(ItemInteraction.Activate, () => {
            this.setOwnership(Ownership.Equipped);
            const result: OnItemUseEffect = { type: OnItemUseType.Equip, value: EquipmentSlot.Head };
            return [result];
        });

        this.interactions().setOnPlayerState(this.onPlayerState.bind(this));

        this.target = {
            body: () => this.body,
            penetrationResistance: () => 5,
            onProjectileHit: this.onProjectileHit.bind(this),
            enabled: () => !this.shouldBeDeleted()
        }
    }

    private onPlayerState(state: PlayerState): OnItemUseEffect[] {
        if (state === PlayerState.Ragdoll) {
            return [{ type: OnItemUseType.Unequip, value: EquipmentSlot.Head }];
        }
        return [];
    }

    public onEquip(slot: EquipmentSlot): void {
        this.body.width = 40;
        this.body.height = 40;
        if (slot === EquipmentSlot.Head) {
            ProjectileManager.addCollidable(this.target);
        }
    }

    public onUnequip(): void {
        this.body.width = 32;
        this.body.height = 32;
        ProjectileManager.removeCollidable(this.target);
    }

    private onProjectileHit(effects: ProjectileEffect[], pos: Vector, local: boolean): void {
        effects.forEach(effect => this.onProjectileEffect(effect, pos, local));
    }

    public onProjectileEffect(effect: ProjectileEffect, pos: Vector, local: boolean) {
        if (!local || this.shouldBeDeleted()) {
            return;
        }
        if (effect.type === ProjectileEffectType.Damage) {
            this.setToDelete();
            AudioManager.get().play(Sound.ting);
            Connection.get().sendGameMessage(GameMessage.ItemProjectileEffect, { id: this.id, effect, pos });
        }
    }

    public draw(): void {
        const frame = this.damaged ? Helmet.frames.broken : this.getOwnership() === Ownership.Equipped ? Helmet.frames.equipped : Helmet.frames.default;
        const drawSize = 32;

        Helmet.spriteSheet.draw(this.getDrawPos(drawSize), drawSize, this.body.isFlip(), this.getAngle(), frame);
    }
}

export { Helmet };