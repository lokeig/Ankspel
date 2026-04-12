import { Vector } from "@math";
import { AxisDirection } from "@common";
import { IParticle } from "@game/Particles";
import { TileMarker } from "./tileMarker";
import { GlowingBullet } from "./glowingBullet";

class BulletReboundVFX implements IParticle {
    private marker: TileMarker | null;
    private glowingBullets: GlowingBullet[];

    constructor(pos: Vector, angle: number, normal: AxisDirection) {
        this.marker = new TileMarker(pos, normal);

        const glowingBulletCount = 5;
        this.glowingBullets = new Array<GlowingBullet>(glowingBulletCount);

        for (let i = 0; i < glowingBulletCount; i++) {
            const bulletGlow = new GlowingBullet(pos, angle);
            this.glowingBullets[i] = bulletGlow;
        }
    }

    public update(deltaTime: number): void {
        for (const glow of this.glowingBullets) {
            glow.update(deltaTime);

            if (glow.shouldBeDeleted()) {
                this.glowingBullets = [];
                break;
            }
        }
        if (!this.marker) {
            return;
        }
        this.marker.update(deltaTime);
        if (this.marker.shouldBeDeleted()) {
            this.marker = null;
        }
    }

    public draw(): void {
        if (this.marker) {
            this.marker.draw();
        }
        this.glowingBullets.forEach(glow => glow.draw());
    }

    public shouldBeDeleted(): boolean {
        return this.glowingBullets.length === 0;
    }
}

export { BulletReboundVFX };