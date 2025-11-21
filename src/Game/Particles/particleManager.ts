import { IParticle } from "./IParticle";

class ParticleManager {
    private static particles: Set<IParticle> = new Set();

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

    public static addParticle(particle: IParticle): void {
        this.particles.add(particle);
    }
}

export { ParticleManager };