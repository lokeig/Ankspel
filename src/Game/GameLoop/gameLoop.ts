import { StateMachine, Input } from "@common";
import { Render } from "@render";
import { LobbyList } from "@game/Server";
import { GameLoopState } from "./gameLoopState";
import { InMatchLoop } from "./inMatchLoop";
import { NetworkHandler } from "./NetworkHandling/networkHandler";

class GameLoop {
    private lastTime = 0;
    private stateMachine: StateMachine<GameLoopState>;

    constructor() {
        NetworkHandler.init();
        LobbyList.get().show();
        const initalState = GameLoopState.playing;
        this.stateMachine = new StateMachine(initalState);
        this.stateMachine.addState(GameLoopState.playing, new InMatchLoop());
        NetworkHandler.onMapLoad((time: number) => { this.startGame(time); });
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
        NetworkHandler.update(deltaTime);

        requestAnimationFrame(this.gameLoop);
    };
}


export { GameLoop };