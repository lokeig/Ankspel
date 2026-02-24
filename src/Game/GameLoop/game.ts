import { ParticleManager } from "@game/Particles";
import { ItemManager } from "@game/Item";
import { PlayerManager } from "@game/Player";
import { ProjectileManager } from "@game/Projectile";
import { TileManager } from "@game/StaticObjects/Tiles";
import { Camera } from "@game/Camera";

class DuckGame {
    private camera = new Camera();

    public update(deltaTime: number): void {
        const fixedStep = 0.1;
        const maxIterations = 20;

        let remainingDelta = deltaTime;
        let iterations = 0;

        while (remainingDelta > 0 && iterations < maxIterations) {

            const currentDelta = Math.min(fixedStep, remainingDelta);
            remainingDelta -= currentDelta;

            this.gameUpdate(currentDelta);

            iterations++;
        }
    }

    public reset(): void {
        this.camera.initialize();
    }

    private gameUpdate(deltaTime: number): void {
        ProjectileManager.update(deltaTime);
        ItemManager.update(deltaTime);
        PlayerManager.update(deltaTime);
        ParticleManager.update(deltaTime);
        this.camera.update(deltaTime);
    }

    public draw(): void {
        ProjectileManager.draw();
        ItemManager.draw();
        PlayerManager.draw();
        ParticleManager.draw();
        TileManager.draw();
    }
}

export { DuckGame };