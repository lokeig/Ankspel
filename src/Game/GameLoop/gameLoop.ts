import { StateMachine, Input } from "@common";
import { Render } from "@render";
import { LobbyList, GameServer } from "@server";
import { GameLoopState } from "./gameLoopState";
import { InMatchLoop } from "./States/inMatchLoop";

class GameLoop {
    private lastTime = 0;
    private stateMachine: StateMachine<GameLoopState>;

    constructor() {
        LobbyList.get().show();
        const initalState = GameLoopState.playing;
        this.stateMachine = new StateMachine(initalState);
        this.stateMachine.addState(GameLoopState.playing, new InMatchLoop());
        this.stateMachine.enterState();
        
        GameServer.get().emitter.subscribe("start-game", () => {
            requestAnimationFrame(this.gameLoop);
            LobbyList.get().hide();
        });
    }

    private gameLoop = (currentTime: number) => {
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        Render.get().clear();
        this.stateMachine.update(deltaTime);
        this.stateMachine.draw();
        Input.update();
        
        GameServer.get().clearMessages();
        requestAnimationFrame(this.gameLoop);
    }
}

export { GameLoop };