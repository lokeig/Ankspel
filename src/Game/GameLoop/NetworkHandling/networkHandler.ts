import { PlayerManager } from "@player";
import { Connection, GameMessage } from "@game/Server";
import { Countdown, IDManager, Input } from "@common";
import { PlayerNetworkHandler } from "./playerNetworkHandler";
import { ItemMessageHandler } from "./itemNetworkHandler";
import { MapNetworkHandler } from "./mapNetworkHandler";
import { MapManager } from "@game/Map";
import { MainMenu } from "@game/Server/Lobby/mainMenu";

const tickRate = 60;

class NetworkHandler {
    private static readyCount: number = 0;
    private static messageTimer = new Countdown(1 / tickRate);
    private static onStart: () => void;
    private static readyToPlay: boolean = false;
    
    static init() {
        PlayerNetworkHandler.init();
        ItemMessageHandler.init();
        MapNetworkHandler.init();

        Connection.get().onGameStart((userID) => {
            IDManager.setBaseOffset(userID * (2 << 16));
            PlayerManager.create(MainMenu.get().getChosenColor());
            Connection.get().sendGameMessage(GameMessage.ReadyToPlay, {});
            this.readyToPlay = true;
            this.checkReadyToStart();
        });

        const gameEvent = Connection.get().gameEvent;

        gameEvent.subscribe(GameMessage.StartPlaying, () => {
            this.start()
        });

        gameEvent.subscribe(GameMessage.ReadyToPlay, () => {
            this.readyCount++;
            this.checkReadyToStart();
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
        PlayerManager.create(MainMenu.get().getChosenColor());
        PlayerManager.create(MainMenu.get().getChosenColor());
        PlayerManager.create(MainMenu.get().getChosenColor());
        PlayerManager.create(MainMenu.get().getChosenColor());

        Connection.get().enableLocalMode();

        this.start();
        const mapId = MapManager.getRandomMap()[0];
        MapNetworkHandler.forceStart(mapId);
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