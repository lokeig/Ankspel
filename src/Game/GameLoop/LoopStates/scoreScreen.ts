import { Countdown, GameLoopState, IState, Lerp, lerpEase } from "@common";
import { DuckGame } from "../game";
import { Connection, GameMessage } from "@server";
import { PlayerManager } from "@player";
import { ScoreBoard } from "@menu";
import { Render, RenderSpace, zIndex } from "@render";

class ScoreScreen implements IState<GameLoopState> {
    private static timeInState = 4;
    private game: DuckGame;
    private timer = new Countdown(ScoreScreen.timeInState);
    private opacityLerp = new Lerp(1 / ScoreScreen.timeInState, this.lerp.bind(this));
    private finalThreshold = 1;

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

    private handlePlayerScores(): void {
        const scores: { score: number, name: string, color: string }[] = [];
        const players = PlayerManager.getPlayers();
        players.sort((a, b) => b.getScore() - a.getScore());
        players.forEach(player => {
            scores.push({ score: player.getScore(), name: player.getName(), color: player.getColor() });
        });
        ScoreBoard.getScore().refresh(scores);
    }

    public stateEntered(): void {
        console.log("entered score");

        this.game.restart();
        ScoreBoard.getScore().show();
        PlayerManager.getLocal().forEach(player => player.character.controls.addLock("scoreScreen"));
        this.handlePlayerScores();

        this.timer.reset();
        this.opacityLerp.startLerp(0, 1);
        ScoreBoard.getScore().setOpacity(0);

        if (!Connection.get().isHost()) {
            return;
        }
        Connection.get().sendGameMessage(GameMessage.GameState, { state: GameLoopState.ScoreScreen });
    }

    public stateUpdate(deltaTime: number) {
        this.game.update(deltaTime);
        this.timer.update(deltaTime);

        const opacity = this.opacityLerp.update(deltaTime);
        ScoreBoard.getScore().setOpacity(opacity);
    }

    public stateChange(): GameLoopState {
        if (!this.timer.isDone()) {
            return GameLoopState.ScoreScreen;
        }
        const players = PlayerManager.getPlayers().filter(player => player.getScore() >= this.finalThreshold);
        if (players.length === 1) {
            players[0].win();
            Connection.get().sendGameMessage(GameMessage.PlayerWins, { id: players[0].getId(), wins: players[0].getWins() });
            return GameLoopState.TrophiesScreen;
        }
        if (players.length > 1) {
            this.game.setFinalRound(players);
        }
        return GameLoopState.LoadingMap;
    }

    public stateExited(): void {
        ScoreBoard.getScore().hide();
        PlayerManager.getLocal().forEach(player => player.character.controls.removeLock("scoreScreen"));
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

export { ScoreScreen };