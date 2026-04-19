import { EquipmentSlot, Frame, ItemInteraction, PlayerAnim, PlayerState, ProjectileEffect, ProjectileEffectType, SpriteSheet } from "@common";
import { Equippable, OnItemUseEffect, OnItemUseType, Ownership } from "@item";
import { Vector } from "@math";
import { AudioManager, Sound } from "@game/Audio";
import { Item } from "../item";
import { Images } from "@render";

class Chestplate extends Item implements Equippable {
    private static frames = { default: new Frame(), equipped: new Frame(), overArm: new Frame() };
    private static spirte: SpriteSheet;
    private drawOverShoulder: boolean = false;

    static {
        this.spirte = new SpriteSheet(Images.armor);
        this.frames.default.set(0, 0);
        this.frames.equipped.set(0, 1);
        this.frames.overArm.set(0, 2);
    }

    constructor(pos: Vector, id: number) {
        const width = 25;
        const height = 20;
        super(pos, width, height, id);

        this.playerInteractions.setUse(ItemInteraction.Activate, () => {
            this.ownership = Ownership.Equipped;
            const result: OnItemUseEffect = { type: OnItemUseType.Equip, value: EquipmentSlot.Body };
            return [result];
        });

        this.playerInteractions.setOnPlayerState(PlayerState.Ragdoll, () => {
            if (this.ownership === Ownership.Equipped) {
                return [];
            } else {
                return [{ type: OnItemUseType.Unequip, value: this.currentSlot }];
            }
        });

        this.setProjectileCollision(10, this.onProjectileEffect.bind(this), () => !this.shouldBeDeleted(), () => [ProjectileEffectType.Damage]);
        this.projectileCollision!.disable();
    }

    public onPlayerAnimation(anim: PlayerAnim, holding: boolean): void {
        this.drawOverShoulder = false;
        if (holding) {
            return;
        }
        switch (anim) {
            case PlayerAnim.Walk: break;
            case PlayerAnim.Idle: break;
            case PlayerAnim.Turn: break;

            default: return;
        }
        this.drawOverShoulder = true;
    }

    public defensive(): boolean {
        return true;
    }

    public onEquip(): void {
        this.currentSlot = EquipmentSlot.Body;
        this.body.width = 40;
        this.body.height = 40;

        this.projectileCollision!.enable();
    }

    public onUnequip(): void {
        this.currentSlot = EquipmentSlot.Hand;
        this.body.width = 25;
        this.body.height = 20;

        this.projectileCollision!.disable();
    }

    public takeDamage(): void {

    }

    public onProjectileEffect(effect: ProjectileEffect, _pos: Vector, local: boolean) {
        if (!local) {
            return;
        }
        if (effect.type === ProjectileEffectType.Damage) {
            this.setToDelete();
            AudioManager.get().play(Sound.ting);
        }
    }

    public draw(): void {
        const drawSize = 32;
        const frame = this.ownership === Ownership.Equipped ? Chestplate.frames.equipped : Chestplate.frames.default;
        Chestplate.spirte.draw(this.getDrawPos(drawSize), drawSize, this.body.isFlip(), this.getAngle(), this.getZIndex(), frame);
    }

    public drawTopLayer(): void {
        if (!this.drawOverShoulder) {
            return;
        }
        const drawSize = 32;
        Chestplate.spirte.draw(this.getDrawPos(drawSize), drawSize, this.body.isFlip(), this.getAngle(), this.getZIndex(), Chestplate.frames.overArm);
    }
}

export { Chestplate };