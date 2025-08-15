import { ParticleInterface } from "./Common/particleInterface";

export class ParticleHandler {
    private static particles: Set<ParticleInterface> = new Set();

    public static update(deltaTime: number): void {
        for (const particle of this.particles.values()) {
            particle.update(deltaTime);
            if (particle.shouldBeDeleted()) {
                this.particles.delete(particle);
            }
        }
    }

    public static draw(): void {
        for (const particle of this.particles.values()) {
            particle.draw();
        } 
    }

    public static addParticle(particle: ParticleInterface): void {
        this.particles.add(particle);
    }
}