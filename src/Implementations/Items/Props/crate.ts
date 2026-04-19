import { Frame, ProjectileEffect, ProjectileEffectType, SpriteSheet } from "@common";
import { Images } from "@render";
import { Vector } from "@math";
import { BaseProp } from "./baseProp";
import { AudioManager, Sound } from "@game/Audio";

class Crate extends BaseProp {
    private static sprite = new SpriteSheet(Images.crate);
    private static drawSize = 32;
    private static holdOffset = new Vector(14, -5);
    private static maxLives = 3;
    private static frames = [new Frame(), new Frame(0, 1), new Frame(0, 2), new Frame(0, 3)];

    private timesHit: number = 0;

    constructor(pos: Vector, id: number) {
        const width = 32;
        const height = 32;
        super(pos, width, height, id);

        this.info.holdOffset = Crate.holdOffset;

        this.setProjectileCollision(10, this.onProjectileEffect.bind(this), () => !this.shouldBeDeleted(), () => [ProjectileEffectType.Damage]);
    }

    public onProjectileEffect(effect: ProjectileEffect, _pos: Vector, local: boolean): void {
        if (!local) {
            return;
        }
        if (effect.type === ProjectileEffectType.Damage) {
            this.timesHit++;

            if (this.timesHit > Crate.maxLives) {
                AudioManager.get().play(Sound.crateDestroy);
                this.setToDelete();
            } else {
                AudioManager.get().play(Sound.woodHit);
            }
        }
    }

    public draw(): void {
        const frame = Crate.frames[this.timesHit];
        Crate.sprite.draw(this.getDrawPos(Crate.drawSize), Crate.drawSize, this.body.isFlip(), this.angle.worldAngle, this.getZIndex(), frame)
    }
}

export { Crate };