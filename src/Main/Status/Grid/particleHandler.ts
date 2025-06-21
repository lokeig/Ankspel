import { ParticleInterface } from "../Particles/Interface";

export class ParticleHandler {
    private static particles: Set<ParticleInterface> = new Set();

    public static update(deltaTime: number): void {
        for (const particle of this.particles.values()) {
            particle.update(deltaTime);
        }
    }

    public static draw(): void {
        for (const particle of this.particles.values()) {
            particle.draw();
        } 
    }
}