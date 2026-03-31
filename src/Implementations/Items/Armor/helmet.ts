import { Vector } from "@math";
import { Equippable, OnItemUseEffect, OnItemUseType, Ownership } from "@item";
import { Item } from "../item";
import { EquipmentSlot, Frame, ItemInteraction, PlayerAnim, PlayerState, ProjectileEffect, ProjectileEffectType, SpriteSheet } from "@common";
import { Images } from "@render";
import { AudioManager, Sound } from "@game/Audio";

class Helmet extends Item implements Equippable {
    private static frames = { default: new Frame(), broken: new Frame(), equipped: new Frame() };
    private static spriteSheet: SpriteSheet;
    private static pixelOffset = new Vector(0, -1);

    private damaged: boolean = false;

    private static standardWidth: number = 20;
    private static standardHeight: number = 26;

    private static equippedWidth: number = 22;
    private static equippedHeight: number = 22;

    private static holdOffset = new Vector(10, -4); 

    private equipmentSlot: EquipmentSlot = EquipmentSlot.Hand;

    static {
        this.spriteSheet = new SpriteSheet(Images.armor);

        this.frames.default.set(1, 0);
        this.frames.broken.set(1, 1);
        this.frames.equipped.set(1, 2);
    }

    constructor(pos: Vector, id: number) {
        super(pos, Helmet.standardWidth, Helmet.standardHeight, id);
        this.info.holdOffset = Helmet.holdOffset;

        this.playerInteractions.setUse(ItemInteraction.Activate, () => {
            this.ownership = Ownership.Equipped;
            const result: OnItemUseEffect = { type: OnItemUseType.Equip, value: EquipmentSlot.Head };
            return [result];
        });

        this.setProjectileCollision(10, this.onProjectileEffect.bind(this), () => !this.shouldBeDeleted())

        this.playerInteractions.setOnPlayerState(PlayerState.Ragdoll, () => [{ type: OnItemUseType.Unequip, value: this.equipmentSlot }]);
        this.projectileCollision.disable();
    }

    public onPlayerAnimation(_anim: PlayerAnim, _holding: boolean): void {
        return;
    }

    public defensive(): boolean {
        return true;
    }

    public takeDamage(): void {
        AudioManager.get().play(Sound.metalHit)
        this.damaged = true;
    }

    public onEquip(): void {
        this.equipmentSlot = EquipmentSlot.Head;

        this.body.width = Helmet.equippedWidth;
        this.body.height = Helmet.equippedHeight;
        this.projectileCollision.enable();
    }

    public onUnequip(): void {
        this.equipmentSlot = EquipmentSlot.Hand;

        this.body.width = Helmet.standardWidth;
        this.body.height = Helmet.standardHeight;
        this.projectileCollision.disable();
    }

    public onProjectileEffect(effect: ProjectileEffect, _pos: Vector, local: boolean) {
        if (!local || this.shouldBeDeleted()) {
            return;
        }
        if (effect.type === ProjectileEffectType.Damage) {
            this.setToDelete();
            AudioManager.get().play(Sound.ting);
        }
    }

    public draw(): void {
        const drawSize = 32;
        const frame = this.damaged ? Helmet.frames.broken : this.ownership === Ownership.Equipped ? Helmet.frames.equipped : Helmet.frames.default;
        Helmet.spriteSheet.draw(this.getDrawPos(drawSize, Helmet.pixelOffset), drawSize, this.body.isFlip(), this.getAngle(), this.getZIndex(), frame);
    }
}

export { Helmet };