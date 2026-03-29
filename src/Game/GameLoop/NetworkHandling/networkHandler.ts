import { PlayerManager } from "@player";
import { Connection, GameMessage } from "@game/Server";
import { Countdown, GameLoopState, IDManager, Input } from "@common";
import { PlayerNetworkHandler } from "./playerNetworkHandler";
import { ItemMessageHandler } from "./itemNetworkHandler";
import { MapNetworkHandler } from "./mapNetworkHandler";
import { DuckGame } from "../game";

const tickRate = 60;

class NetworkHandler {
    private static onStart: () => void;
    private static onState: (state: GameLoopState) => void;
    private static readyCount: number = 0;
    private static messageTimer = new Countdown(1 / tickRate);
    private static readyToPlay: boolean = false;


    static init(game: DuckGame) {
        PlayerNetworkHandler.init(game);
        ItemMessageHandler.init();
        MapNetworkHandler.init();

        const connection = Connection.get();
        const gameEvent = connection.gameEvent;

        connection.onGameStart((userID) => {
            IDManager.setBaseOffset(userID * (2 << 16));
            PlayerManager.create();
            connection.sendGameMessage(GameMessage.ReadyToPlay, {});
            this.readyToPlay = true;
            this.checkReadyToStart();
        });

        gameEvent.subscribe(GameMessage.StartPlaying, () => {
            this.start()
        });

        gameEvent.subscribe(GameMessage.ReadyToPlay, () => {
            this.readyCount++;
            this.checkReadyToStart();
        });

        gameEvent.subscribe(GameMessage.ChatMessage, ({ sender, text }) => {
            game.chat.write({ sender, text, timeAlive: 0 });
        });

        gameEvent.subscribe(GameMessage.GameState, ({ state }) => {
            if (!connection.isHost()) {
                this.onState(state);
            }
        });

        Input.onKey("q", this.quickStart);
    }

    private static checkReadyToStart(): void {
        if (!Connection.get().isHost()) {
            return;
        }
        if (this.readyCount !== Connection.get().connectionCount()) {
            return;
        }
        if (!this.readyToPlay) {
            return;
        }
        Connection.get().sendGameMessage(GameMessage.StartPlaying, {});
        this.start();
        this.readyCount = 0;
    }

    private static quickStart = (): void => {
        PlayerManager.create();
        PlayerManager.create();
        PlayerManager.create();
        PlayerManager.create();

        Connection.get().enableLocalMode();

        this.start();
    }

    private static start(): void {
        this.onStart();
        Input.removeOnKey("q", this.quickStart);
    }

    public static setOnStart(e: () => void) {
        this.onStart = e;
    }

    public static setOnState(e: (state: GameLoopState) => void): void {
        this.onState = e;
    }

    public static update(deltaTime: number): void {
        this.messageTimer.update(deltaTime);
        if (this.messageTimer.isDone()) {
            PlayerNetworkHandler.sendLocalPlayersInfo();
            this.messageTimer.reset();
        }
    }
}
export { NetworkHandler };