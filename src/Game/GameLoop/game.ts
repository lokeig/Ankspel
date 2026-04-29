import { ParticleManager } from "@game/Particles";
import { Player, PlayerManager } from "@player";
import { ProjectileManager } from "@projectile";
import { TileManager } from "@game/Tiles";
import { Camera } from "@game/Camera";
import { Parallax } from "@game/ParallaxBackground/parallax";
import { MapManager } from "@game/Map";
import { Connection } from "@server";
import { Input, MaxMinPositions, Utility } from "@common";
import { MapLoader } from "./mapLoader";
import { SpawnerManager } from "@game/Spawner";
import { ItemManager } from "@item";
import { Render } from "@render";
import { Chat } from "./chat";

class DuckGame {
    private camera = new Camera();
    private background: Parallax | null = null;
    private mapBounds!: MaxMinPositions;
    private roundsPlayed: number = 0;
    public chat = new Chat();

    private inFinal: Player[] = [];

    public update(deltaTime: number): void {
        const fixedStep = 0.02;
        const maxIterations = 20;

        let remainingDelta = deltaTime;
        let iterations = 0;

        while (remainingDelta > 0 && iterations < maxIterations) {
            const currentDelta = Math.min(fixedStep, remainingDelta);
            remainingDelta -= currentDelta;

            this.gameUpdate(currentDelta);
            Input.update();

            iterations++;
        }
    }

    public initialize(): void {
        this.camera.initialize(this.mapBounds);
    }

    public loadMap(id: number, seed: number): void {
        const background = MapLoader.load(MapManager.getMap(id), seed, Connection.get().isHost());
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

    public restart(): void {
        this.roundsPlayed = 0;
        this.inFinal.length = 0;
    }

    public isFinalRound(): boolean {
        return this.inFinal.length !== 0;
    }

    public setFinalRound(players: Player[]): void {
        this.inFinal = players;
        PlayerManager.getPlayers().forEach(player => {
            const inFinal = players.includes(player);
            player.setEnabled(inFinal);
        })
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
        if (this.background) {
            this.background.update(deltaTime);
        }
    }

    public draw(): void {
        if (this.background) {
            this.background.draw(this.mapBounds, this.camera.getCurrentPos());
        }

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