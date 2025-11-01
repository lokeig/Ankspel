import { StateMachine, Input } from "@common";
import { Render } from "@render";
import { LobbyList, GameServer, GMsgType } from "@server";
import { GameLoopState } from "./gameLoopState";
import { InMatchLoop } from "./inMatchLoop";
import { PlayerManager } from "@player";
import { GameLoopUtility } from "./gameLoopUtility";
import { GameMap, MapManager } from "@game/Map";

class GameLoop {
    private lastTime = 0;
    private stateMachine: StateMachine<GameLoopState>;
    private readyCount = 0;

    constructor() {
        LobbyList.get().show();
        const initalState = GameLoopState.playing;
        this.stateMachine = new StateMachine(initalState);
        this.stateMachine.addState(GameLoopState.playing, new InMatchLoop());

        GameServer.get().emitter.subscribe(GMsgType.newPlayer, ({ local, id }) => {
            PlayerManager.addPlayer(local, id);
        });

        GameServer.get().emitter.subscribe(GMsgType.loadMap, ({ name }) => {
            const map = MapManager.getMap(name);
            GameLoopUtility.loadMap(map);

            if (GameServer.get().isHost()) {
                this.hostInitializeMap(map);
            }
        });

        GameServer.get().emitter.subscribe(GMsgType.dataDone, () => {
            if (!GameServer.get().isHost()) {
                GameServer.get().sendMessage(GMsgType.readyToStart, {});
            }
        });

        GameServer.get().emitter.subscribe(GMsgType.readyToStart, () => {
            if (GameServer.get().isHost()) {
                this.readyCount++;
                this.checkReadyToStart();
            }
        });

        GameServer.get().emitter.subscribe(GMsgType.playerSpawn, ({ id, location }) => {
            PlayerManager.getPlayerFromID(id)!.setCharacter(location);
        });

        GameServer.get().emitter.subscribe(GMsgType.startGame, ({ time }) => {
            this.startGame(time);
        });
    }

    private hostInitializeMap(map: GameMap): void {
        const players = PlayerManager.getPlayers();
        const spawns = map.getRandomSpawnLocations(players.length);

        for (let i = 0; i < players.length; i++) {
            players[i].setCharacter(spawns[i]);
            GameServer.get().sendMessage(GMsgType.playerSpawn, {
                id: PlayerManager.getPlayersID(players[i])!,
                location: spawns[i],
            });
        }

        if (PlayerManager.getPlayers().length === 1) {
            this.startGame(0);
        }

        GameServer.get().sendMessage(GMsgType.dataDone, {});
    }

    private checkReadyToStart(): void {
        const totalPlayers = PlayerManager.getPlayers().length;
        if (this.readyCount === totalPlayers - 1) {
            const timeToStart = Date.now() + 500;
            GameServer.get().sendMessage(GMsgType.startGame, {
                time: timeToStart
            });
            this.startGame(timeToStart);
        }
    }

    private startGame(time: number): void {
        setTimeout(() => {
            LobbyList.get().hide();
            requestAnimationFrame(this.gameLoop);
        }, Math.max(time - Date.now(), 0));
    }

    private gameLoop = (currentTime: number) => {
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        Render.get().clear();
        this.stateMachine.update(deltaTime);
        this.stateMachine.draw();
        Input.update();

        requestAnimationFrame(this.gameLoop);
    };
}


export { GameLoop };