import { Vector, Countdown, Utility } from "@common";
import { IParticl } from "@game/Particles";
import { ExplosionParticle } from "./explosionParticle";

class ExplosionVFX implements IParticl {
    
    private particles: Set<ExplosionParticle> = new Set;
    private particleSpawnLocations: Vector[];
    private nextParticleCountdown = new Countdown(0.01);
    private amountOfAddedParticles: number = 0;
    private order: number[];

    constructor(pos: Vector) {
        const radius = 50;
        const amount = 8;

        this.particleSpawnLocations = Utility.Vector.getPointsAroundCircle(pos, radius, amount);
        Utility.Vector.randomOffsetVectorArray(this.particleSpawnLocations, 7);
        this.particleSpawnLocations.push({ x: pos.x, y: pos.y });
        this.order = Utility.Random.getRandomArray(amount + 1);
        this.nextParticleCountdown.setToReady();
    }

    public update(deltaTime: number): void {

        for (const particle of this.particles.values()) {
            particle.update(deltaTime);
            if (particle.setToDelete) {
                this.particles.delete(particle);
            }
        }

        this.nextParticleCountdown.update(deltaTime);
        
        if (this.nextParticleCountdown.isDone() && this.amountOfAddedParticles < this.particleSpawnLocations.length) {
            const positionArrayIndex = this.order[this.amountOfAddedParticles];
            const location = this.particleSpawnLocations[positionArrayIndex];
            const rotation = Utility.Random.getRandomNumber(-Math.PI, Math.PI);
            const scale = Utility.Random.getRandomNumber(0.7, 1.2);
            this.particles.add(new ExplosionParticle(location, rotation, scale));

            this.amountOfAddedParticles += 1;
            this.nextParticleCountdown.reset();
        }
    }
    
    public draw(): void {
        for (const particle of this.particles.values()) {
            particle.draw();
        }
    }

    public shouldBeDeleted(): boolean {
        return this.particles.size === 0;
    }
}

export { ExplosionVFX };