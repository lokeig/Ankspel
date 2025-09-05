import { Render } from "../../HMI/render";
import { GameLoopState } from "./gameLoopState";
import { Input } from "./MainGame/Common/input";
import { StateMachine } from "./MainGame/Common/StateMachine/stateMachine";
import { InMatchLoop } from "./MainGame/inMatchLoop";
import { GameServer } from "./Server/Common/server";

export class GameLoop {
    private lastTime = 0;
    private stateMachine: StateMachine<GameLoopState>;

    constructor() {
        const initalState = GameLoopState.inMatch;
        this.stateMachine = new StateMachine(initalState);

        this.stateMachine.addState(GameLoopState.inMatch, new InMatchLoop());
        this.waitForID().then(() => {
            this.stateMachine.enterState();
            requestAnimationFrame(this.gameLoop);
        });
    }

    private async waitForID() {
        while (!GameServer.get().getID()) {
            await new Promise(r => setTimeout(r, 100));
        }
    }

    private gameLoop = (currentTime: number) => {
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        const fixedStep = 0.1;
        const maxIterations = 20;

        let remainingDelta = deltaTime;
        let iterations = 0;

        while (remainingDelta > 0 && iterations < maxIterations) {

            const currentDelta = Math.min(fixedStep, remainingDelta);
            remainingDelta -= currentDelta;

            this.stateMachine.update(currentDelta);

            iterations++;
        }

        Input.update();

        Render.get().clear();
        this.stateMachine.draw();

        GameServer.get().update();

        requestAnimationFrame(this.gameLoop);
    }
}