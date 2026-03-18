import { ParticleManager } from "@game/Particles";
import { ItemManager } from "@game/Item";
import { PlayerManager } from "@game/Player";
import { ProjectileManager } from "@game/Projectile";
import { TileManager } from "@game/Tiles";
import { Camera } from "@game/Camera";
import { Parallax } from "@game/ParallaxBackground/parallax";
import { MapManager } from "@game/Map";
import { Connection } from "@server";
import { MaxMinPositions } from "@common";
import { MapLoader } from "./mapLoader";
import { SpawnerManager } from "@game/Spawner";
import { Render } from "@render";
import { Chat } from "./chat";

class DuckGame {
    private camera = new Camera();
    private background!: Parallax;
    private mapBounds!: MaxMinPositions;
    private roundsPlayed: number = 0;
    public chat = new Chat();

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

    public initialize(): void {
        this.camera.initialize(this.mapBounds);
    }

    public loadMap(id: number): void {
        const background = MapLoader.load(MapManager.getMap(id), Connection.get().isHost());
        const parallax = Parallax.getBackground(background);
        if (!parallax) {
            console.error(parallax, " does not exist");
            return;
        }
        this.background = parallax;
        this.mapBounds = MapLoader.getMapMinMax();
        this.roundsPlayed++;
    }

    public getRoundsPlayed(): number {
        return this.roundsPlayed;
    }

    private gameUpdate(deltaTime: number): void {
        ProjectileManager.update(deltaTime);
        ItemManager.update(deltaTime);
        if (this.chat.isChatOpen()) {
            PlayerManager.getLocal().forEach(player => player.character.controls.addLock("chatOpen"));
        } else {
            PlayerManager.getLocal().forEach(player => player.character.controls.removeLock("chatOpen"));
        }
        PlayerManager.update(deltaTime, this.mapBounds.maxY);
        ParticleManager.update(deltaTime);
        SpawnerManager.update(deltaTime);
        this.camera.update(deltaTime, this.mapBounds);
        this.chat.update(deltaTime);
        this.background.update(deltaTime);
    }

    public draw(): void {
        this.background.draw(this.mapBounds, this.camera.getCurrentPos());

        ProjectileManager.draw();
        ItemManager.draw();
        SpawnerManager.draw();
        PlayerManager.draw();
        ParticleManager.draw();
        TileManager.draw();

        this.chat.draw();

        Render.get().render();
    }
}

export { DuckGame };