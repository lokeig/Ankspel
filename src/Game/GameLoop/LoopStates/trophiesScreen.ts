import { Countdown, GameLoopState, IState, Lerp } from "@common";
import { DuckGame } from "../game";
import { Connection, GameMessage } from "@server";
import { Render, RenderSpace, zIndex } from "@render";
import { PlayerManager } from "@player";

class TrophiesScreen implements IState<GameLoopState> {
    private static timeInState = 4;
    private game: DuckGame;
    private timer = new Countdown(TrophiesScreen.timeInState);

    private opacityLerp = new Lerp(1 / TrophiesScreen.timeInState, this.lerp.bind(this));

    constructor(game: DuckGame) {
        this.game = game;
    }

    private lerp(a: number, b: number, t: number): number {
        const opacThreshold = 0.1;
        if (t < opacThreshold) {
            t *= 1 / opacThreshold;
            t = t * t * (3 - 2 * t);
            return a + (b - a) * t;
        }
        if (t > 1 - opacThreshold) {
            t = 1 - t;
            t *= 1 / opacThreshold;
            t = t * t * (3 - 2 * t);
            return a + (b - a) * t;
        }
        return 1;
    }

    public stateEntered(): void {
        this.timer.reset();
        this.opacityLerp.startLerp(0, 1);

        if (!Connection.get().isHost()) {
            return;
        }
        Connection.get().sendGameMessage(GameMessage.GameState, { state: GameLoopState.TrophiesScreen });
    }

    public stateUpdate(deltaTime: number) {
        this.game.update(deltaTime);
        const opacity = this.opacityLerp.update(deltaTime);
        this.timer.update(deltaTime);
    }

    public stateChange(): GameLoopState {
        if (this.timer.isDone()) {
            return GameLoopState.LoadingMap;
        }
        return GameLoopState.TrophiesScreen;
    }

    public stateExited(): void {
        PlayerManager.getPlayers().forEach(player => player.reset());
    }

    public draw() {
        Render.get().drawSquare(
            {
                x: 0, y: 0,
                width: Render.get().getWidth(),
                height: Render.get().getHeight()
            },
            zIndex.UI,
            0,
            "#000000",
            this.opacityLerp.update(0) * 0.5,
            RenderSpace.Screen
        );
        this.game.draw();
    }
}

export { TrophiesScreen };