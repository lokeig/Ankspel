import { Vector } from "@math";
import { Equippable, OnItemUseEffect, OnItemUseType, Ownership } from "@item";
import { Item } from "../item";
import { EquipmentSlot, Frame, ItemInteraction, PlayerAnim, PlayerState, ProjectileEffect, ProjectileEffectType, SpriteSheet } from "@common";
import { ProjectileManager, ProjectileTarget } from "@projectile";
import { Images } from "@render";
import { Connection, GameMessage } from "@server";
import { AudioManager, Sound } from "@game/Audio";

class Helmet extends Item implements Equippable {
    private static frames = { default: new Frame(), broken: new Frame(), equipped: new Frame() };
    private static spriteSheet: SpriteSheet;

    private damaged: boolean = false;
    private target: ProjectileTarget;

    private static standardWidth: number = 30;
    private static standardHeight: number = 26;

    private static equippedWidth: number = 24;
    private static equippedHeight: number = 24;

    static {
        this.spriteSheet = new SpriteSheet(Images.armor);

        this.frames.default.set(1, 0);
        this.frames.broken.set(1, 1);
        this.frames.equipped.set(1, 2);
    }

    constructor(pos: Vector, id: number) {
        super(pos, Helmet.standardWidth, Helmet.standardHeight, id);

        this.useInteractions.setUse(ItemInteraction.Activate, () => {
            this.setOwnership(Ownership.Equipped);
            const result: OnItemUseEffect = { type: OnItemUseType.Equip, value: EquipmentSlot.Head };
            return [result];
        });

        this.playerInteractions().setOnPlayerState(PlayerState.Ragdoll, () => [{ type: OnItemUseType.Unequip, value: this.equipmentSlot }]);

        this.target = {
            body: () => this.body,
            penetrationResistance: () => 5,
            onProjectileHit: this.onProjectileHit.bind(this),
            enabled: () => !this.shouldBeDeleted()
        }
    }

    public blocksSharpObject(): boolean {
        return true;
    }

    public onPlayerAnimation(_anim: PlayerAnim, _holding: boolean): void {
        return;
    }

    public tanksHeavyProp(): boolean {
        return true;
    }

    public onEquip(): void {
        this.equipmentSlot = EquipmentSlot.Head;

        this.body.width = Helmet.equippedWidth;
        this.body.height = Helmet.equippedHeight;
        ProjectileManager.addCollidable(this.target);
    }

    public onUnequip(): void {
        this.equipmentSlot = EquipmentSlot.Hand;

        this.body.width = Helmet.standardWidth;
        this.body.height = Helmet.standardHeight;
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
        const drawSize = 32;

        const frame = this.damaged ? Helmet.frames.broken : this.getOwnership() === Ownership.Equipped ? Helmet.frames.equipped : Helmet.frames.default;

        Helmet.spriteSheet.draw(this.getDrawPos(drawSize), drawSize, this.body.isFlip(), this.getAngle(), this.getZIndex(), frame);
    }
}

export { Helmet };