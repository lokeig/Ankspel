
import { Countdown } from "../Common/cooldown";
import { getPointsAroundCircle, getRandomArray, getRandomNumber, randomOffsetVectorArray } from "../Common/helperFunctions";
import { Vector } from "../Common/types";
import { ExplosionParticle } from "./explosionParticle";
import { ParticleInterface } from "./particleInterface";

export class ExplosionVFX implements ParticleInterface {
    
    private particles: Set<ExplosionParticle> = new Set;
    private particleSpawnLocations: Vector[];
    private nextParticleCountdown = new Countdown(0.01);
    private amountOfAddedParticles: number = 0;
    private order: number[];

    constructor(pos: Vector) {
        const radius = 50;
        const amount = 8;
        this.particleSpawnLocations = getPointsAroundCircle(pos, radius, amount);
        randomOffsetVectorArray(this.particleSpawnLocations, 7);
        this.particleSpawnLocations.push({ x: pos.x, y: pos.y });
        this.order = getRandomArray(amount + 1);
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
            const positionArrayIndex = this.order[this.amountOfAddedParticles] - 1
            const location = this.particleSpawnLocations[positionArrayIndex];
            const rotation = getRandomNumber(-Math.PI, Math.PI)
            const scale = getRandomNumber(0.7, 1.2);
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