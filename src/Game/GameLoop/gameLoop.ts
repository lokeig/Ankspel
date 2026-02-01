import { StateMachine, Input } from "@common";
import { Render } from "@render";
import { LobbyList } from "@game/Server";
import { GameLoopState } from "./gameLoopState";
import { Playing } from "./LoopStates/playing";
import { NetworkHandler } from "./NetworkHandling/networkHandler";
import { LoadingMap } from "./LoopStates/loadingMap";

class GameLoop {
    private lastTime = 0;
    private stateMachine: StateMachine<GameLoopState>;

    constructor() {
        NetworkHandler.init();
        LobbyList.get().show();

        const initalState = GameLoopState.LoadingMap;
        this.stateMachine = new StateMachine(initalState);

        this.stateMachine.addState(GameLoopState.Playing, new Playing());
        this.stateMachine.addState(GameLoopState.LoadingMap, new LoadingMap());

        NetworkHandler.setOnStart(() => { this.startGame(); });
    }

    private startGame(): void {
        LobbyList.get().hide();
        this.stateMachine.enterState();
        requestAnimationFrame(this.gameLoop);
    }

    private gameLoop = (currentTime: number) => {
        if (this.lastTime === 0) {
            this.lastTime = currentTime;
            requestAnimationFrame(this.gameLoop);
            return;
        }
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