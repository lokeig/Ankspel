import { Render } from "../../../HMI/render";
import { GameLoopState } from "./gameLoopState";
import { Input } from "../Common/input";
import { StateMachine } from "../Common/StateMachine/stateMachine";
import { InMatchLoop } from "./States/inMatchLoop";
import { GameServer } from "../../Server/gameServer";
import { LobbyLoop } from "./States/Lobby/lobbyLoop";

export class GameLoop {
    private lastTime = 0;
    private stateMachine: StateMachine<GameLoopState>;

    constructor() {
        const initalState = GameLoopState.lobby;

        this.stateMachine = new StateMachine(initalState);
        this.stateMachine.addState(GameLoopState.playing, new InMatchLoop());
        this.stateMachine.addState(GameLoopState.lobby, new LobbyLoop());
        this.stateMachine.enterState();

        this.waitForID().then(() => {
            this.stateMachine.enterState();
            requestAnimationFrame(this.gameLoop);
        });
    }

    private async waitForID(): Promise<void> {
        while (!GameServer.get().getID()) {
            await new Promise(r => setTimeout(r, 100));
        }
    }

    private gameLoop = (currentTime: number) => {
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.stateMachine.update(deltaTime);

        Input.update();

        Render.get().clear();
        this.stateMachine.draw();

        GameServer.get().clearMessages();

        requestAnimationFrame(this.gameLoop);
    }
}