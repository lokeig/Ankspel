import { Countdown, IState, SpriteSheet, Utility } from "@common";
import { GameLoopState } from "../gameLoopState";
import { DuckGame } from "../game";
import { Connection } from "@server";
import { MapNetworkHandler } from "../NetworkHandling/mapNetworkHandler";
import { PlayerManager } from "@player";
import { Images, Render, RenderSpace } from "@render";
import { Vector } from "@math";
import { MapManager } from "@game/Map";

class LoadingMap implements IState<GameLoopState> {
    private startPlaying: boolean = false;
    private startPlayingCountdown = new Countdown(1);
    private game: DuckGame;

    private get: SpriteSheet;
    private ready: SpriteSheet;

    public constructor(game: DuckGame) {
        this.game = game;

        MapNetworkHandler.setMapLoad((mapId: number) => {
            this.game.loadMap(mapId);
        });

        MapNetworkHandler.setMapStart(() => {
            this.startPlayingCountdown.reset();
            this.startPlaying = true;
            this.game.initialize();
        });

        this.ready = new SpriteSheet(Images.ready);
        this.ready.setRenderSpace(RenderSpace.Screen);

        this.get = new SpriteSheet(Images.get);
        this.get.setRenderSpace(RenderSpace.Screen);
    }

    public stateEntered(): void {
        PlayerManager.getLocal().forEach(player => player.character.controls.setEnabled(false));
        if (!Connection.get().isHost()) {
            return;
        }
        const map = MapManager.getRandomMap()[0];
        MapNetworkHandler.hostInitializeMap(map);
    }

    public stateUpdate(deltaTime: number) {
        if (this.startPlaying) {
            this.startPlayingCountdown.update(deltaTime);
            this.game.update(deltaTime);
        }
    }

    public stateChange(): GameLoopState {
        if (this.startPlaying && this.startPlayingCountdown.isDone()) {
            return GameLoopState.Playing;
        }
        return GameLoopState.LoadingMap;
    }

    public stateExited(): void {
        PlayerManager.getLocal().forEach(player => player.character.controls.setEnabled(true));

        this.startPlaying = false;
    }

    public draw() {
        this.game.draw();

        if (this.startPlaying && this.startPlayingCountdown.getPercentageReady() > 0.5) {
            const center = new Vector(Render.get().getWidth(), Render.get().getHeight()).divide(2);
            const scale = 12;
            if (this.startPlayingCountdown.getPercentageReady() > 0.75) {
                const size = new Vector(41, 9).multiply(scale);
                center.x -= size.x / 2;
                this.ready.draw(center, size, false, 0);
            } else {
                const size = new Vector(25, 9).multiply(scale);
                center.x -= size.x / 2;
                this.get.draw(center, size, false, 0);
            }
        }
    }
}

export { LoadingMap };