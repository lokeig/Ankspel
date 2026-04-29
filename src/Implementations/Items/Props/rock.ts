import { ProjectileEffect, ProjectileEffectType, SpriteSheet } from "@common";
import { Images } from "@render";
import { Vector } from "@math";
import { BaseProp } from "./baseProp";
import { AudioManager, Sound } from "@game/Audio";

class Rock extends BaseProp {
    private static sprite = new SpriteSheet(Images.rock);
    private static drawSize = new Vector(32, 26);
    private static holdOffset = new Vector(10, -6);

    constructor(pos: Vector, id: number) {
        const width = 20;
        const height = 26;

        super(pos, width, height, id);

        this.info.holdOffset = Rock.holdOffset;
        this.info.weightFactor = 0.5;
        this.setProjectileCollision(10, this.onProjectileEffect.bind(this), () => !this.shouldBeDeleted(), () => [ProjectileEffectType.Damage]);

        this.body.onBottomCollision = () => AudioManager.get().play(Sound.rock);
    }

    public onProjectileEffect(_effect: ProjectileEffect, _pos: Vector, _local: boolean): void {

    }

    public getHoldOffset(): Vector {
        return Rock.holdOffset;
    }

    public draw(): void {
        Rock.sprite.draw(this.getDrawPos(Rock.drawSize), Rock.drawSize, this.body.isFlip(), this.angle.world, this.getZIndex())
    }
}

export { Rock };