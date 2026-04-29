import { Vector } from "@math";
import { Countdown, Frame, SpriteSheet, Utility } from "@common";
import { IParticle } from "@game/Particles";
import { ExplosionParticle } from "./explosionParticle";
import { Images, Render, RenderSpace, zIndex } from "@render";

class ExplosionVFX implements IParticle {

    private particles: Set<ExplosionParticle> = new Set;
    private particleSpawnLocations: Vector[];
    private nextParticleCountdown = new Countdown(0.01);
    private amountOfAddedParticles: number = 0;
    private order: number[];

    private whiteTimer = new Countdown(0.05);

    private static whiteBackground = new SpriteSheet(Images.explosion);
    private static whiteFrame = new Frame(2, 3);
    static {
        this.whiteBackground.setRenderSpace(RenderSpace.Screen);
    }

    constructor(pos: Vector, private flash: boolean) {
        const radius = 50;
        const amount = 8;

        this.particleSpawnLocations = Utility.Vector.getPointsAroundCircle(pos, radius, amount);
        Utility.Vector.randomOffsetVectorArray(this.particleSpawnLocations, 7);
        this.particleSpawnLocations.push(pos.clone());
        this.order = Utility.Random.order(amount + 1);
        this.nextParticleCountdown.setToReady();
    }

    public update(deltaTime: number): void {
        this.particles.forEach(particle => {
            particle.update(deltaTime);
            if (particle.setToDelete) {
                this.particles.delete(particle);
            }
        });
        this.whiteTimer.update(deltaTime);

        this.nextParticleCountdown.update(deltaTime);

        if (this.nextParticleCountdown.isDone() && this.amountOfAddedParticles < this.particleSpawnLocations.length) {
            const positionArrayIndex = this.order[this.amountOfAddedParticles];
            const location = this.particleSpawnLocations[positionArrayIndex];
            const rotation = Utility.Random.getInRange(-Math.PI, Math.PI);
            const scale = Utility.Random.getInRange(0.7, 1.2);
            this.particles.add(new ExplosionParticle(location, rotation, scale));

            this.amountOfAddedParticles += 1;
            this.nextParticleCountdown.reset();
        }
    }

    public draw(): void {
        if (this.flash && !this.whiteTimer.isDone()) {
            const render = Render.get();
            const screen = new Vector(render.getWidth(), render.getHeight());
            ExplosionVFX.whiteBackground.draw(new Vector(), screen, false, 0, zIndex.Particles, ExplosionVFX.whiteFrame);
        }
        for (const particle of this.particles.values()) {
            particle.draw();
        }
    }

    public shouldBeDeleted(): boolean {
        return this.particles.size === 0;
    }
}

export { ExplosionVFX };