import { Countdown, IState } from "@common";
import { GameLoopState } from "../gameLoopState";
import { GameLoopUtility } from "../gameLoopUtility";
import { GameMap, MapManager } from "@game/Map";
import { Connection } from "@server";
import { MapNetworkHandler } from "../NetworkHandling/mapNetworkHandler";

class LoadingMap implements IState<GameLoopState> {
    private startPlaying: boolean = false;
    private startPlayingCountdown = new Countdown(0.1);

    public constructor() {
        MapNetworkHandler.setMapLoad((time: number) => {
            setTimeout(() => {
                this.startPlayingCountdown.reset();
                this.startPlaying = true;
            }, Math.max(time - Date.now(), 0));
        })
    }

    public stateEntered(): void {
        const host = Connection.get().isHost();
        if (!host) {
            return;
        }
        const map: [number, GameMap] = MapManager.getRandomMap();

        MapNetworkHandler.hostInitializeMap(map);
    }

    public stateUpdate(deltaTime: number) {
        if (this.startPlaying) {
            this.startPlayingCountdown.update(deltaTime);
        }
    }

    public stateChange(): GameLoopState {
        if (this.startPlaying && this.startPlayingCountdown.isDone()) {
            return GameLoopState.Playing;
        }
        return GameLoopState.LoadingMap;
    }

    public stateExited(): void {
        this.startPlaying = false;
    }

    public draw() {
        GameLoopUtility.draw();
    }
}

export { LoadingMap };