import { PlayerManager } from "@player";
import { Connection, GameMessage } from "@game/Server";
import { Countdown, IDManager, Input } from "@common";
import { ServerMessage } from "@shared";
import { PlayerNetworkHandler } from "./playerNetworkHandler";
import { ItemMessageHandler } from "./itemNetworkHandler";
import { MapNetworkHandler } from "./mapNetworkHandler";
import { MapLoader, MapManager } from "@game/Map";

class NetworkHandler {
    private static readyCount: number = 0;
    private static messageTimer = new Countdown(0.05);
    private static started: boolean = false;
    private static onStart: () => void;

    static init() {
        PlayerNetworkHandler.init();
        ItemMessageHandler.init();
        MapNetworkHandler.init();

        Connection.get().serverEvent.subscribe(ServerMessage.StartGame, ({ userID }) => {
            IDManager.setBaseOffset(userID * (2 << 16));
            PlayerManager.create();
            Connection.get().sendGameMessage(GameMessage.ReadyToPlay, {});
            if (Connection.get().connectionCount() === 0) {
                Connection.get().enableLocalMode();
                this.start();
            }
        });

        const gameEvent = Connection.get().gameEvent;

        gameEvent.subscribe(GameMessage.StartPlaying, () => {
            this.start()
        });

        gameEvent.subscribe(GameMessage.ReadyToPlay, () => {
            if (!Connection.get().isHost()) {
                return;
            }
            this.readyCount++;
            if (this.readyCount !== Connection.get().connectionCount()) {
                return;
            }
            Connection.get().sendGameMessage(GameMessage.StartPlaying, {});
            this.start();
            this.readyCount = 0;
        });

        Input.onKeyOnce("q", this.quickStart);
    }

    private static quickStart = (): void => {
        PlayerManager.create();
        PlayerManager.create();

        Connection.get().enableLocalMode();

        const map = MapManager.getRandomMap()[1];
        MapLoader.load(map, true);
        this.start();
    }

    private static start(): void {
        this.onStart();
        Input.removeOnKey("q", this.quickStart);
    }

    public static setOnStart(e: () => void) {
        this.onStart = e;
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