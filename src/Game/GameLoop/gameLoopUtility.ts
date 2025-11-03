import { ParticleManager } from "@game/Particles";
import { ItemManager } from "@game/Item";
import { PlayerManager } from "@game/Player";
import { ProjectileManager } from "@game/Projectile";
import { TileManager } from "@game/StaticObjects/Tiles";

class GameLoopUtility {

    public static update(deltaTime: number): void {
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

    private static gameUpdate(deltaTime: number): void {
        ItemManager.update(deltaTime);
        PlayerManager.update(deltaTime);
        ProjectileManager.update(deltaTime);
        ParticleManager.update(deltaTime);
    }

    public static draw(): void {
        ProjectileManager.draw();
        ItemManager.draw();
        PlayerManager.draw();
        ParticleManager.draw();
        TileManager.draw();
    }
}

export { GameLoopUtility };