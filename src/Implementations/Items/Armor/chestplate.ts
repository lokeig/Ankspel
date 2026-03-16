import { EquipmentSlot, Frame, ItemInteraction, PlayerAnim, ProjectileEffect, ProjectileEffectType, SpriteSheet } from "@common";
import { OnItemUseEffect, OnItemUseType, Ownership } from "@item";
import { Vector } from "@math";
import { Connection, GameMessage } from "@server";
import { AudioManager, Sound } from "@game/Audio";
import { ProjectileManager, ProjectileTarget } from "@projectile";
import { Item } from "../item";
import { Images } from "@render";

class Chestplate extends Item {
    private static frames = {
        default: new Frame(),
        equipped: new Frame(),
        overArm: new Frame()
    };
    private static spirte: SpriteSheet;
    private drawOverShoulder: boolean = false;

    private target: ProjectileTarget;

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

        this.useInteractions.set(ItemInteraction.Activate, () => {
            this.setOwnership(Ownership.Equipped);
            const result: OnItemUseEffect = { type: OnItemUseType.Equip, value: EquipmentSlot.Body };
            return [result];
        });

        this.target = {
            body: () => this.body,
            penetrationResistance: () => 5,
            onProjectileHit: this.onProjectileHit.bind(this),
            enabled: () => !this.shouldBeDeleted()
        };

        this.useInteractions.setOnPlayerAnimation((anim, holding) => {
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
        });
    }

    public onEquip(slot: EquipmentSlot): void {
        if (slot !== EquipmentSlot.Body) {
            return;
        }
        this.body.width = 40;
        this.body.height = 40;

        ProjectileManager.addCollidable(this.target);
    }

    public onUnequip(): void {
        this.body.width = 25;
        this.body.height = 20;
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
        const frame = this.getOwnership() === Ownership.Equipped ? Chestplate.frames.equipped : Chestplate.frames.default;
        Chestplate.spirte.draw(this.getDrawPos(drawSize), drawSize, this.body.isFlip(), this.getAngle(), this.getZIndex(), frame);
    }

    public drawTopLayer(): void {
        if (!this.drawOverShoulder) {
            return;
        }
        const drawSize = 32;
        Chestplate.spirte.draw(this.getDrawPos(drawSize), drawSize, this.body.isFlip(), this.getAngle(), this.getZIndex(), Chestplate.frames.overArm);
    }

    public setToDelete(): void {
        super.setToDelete();
        ProjectileManager.removeCollidable(this.target);
    }
}

export { Chestplate };