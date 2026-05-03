import { GameLoopState, StateMachine } from "@common";
import { FontName, Fonts, ImageName, Images, preloadAll, Render } from "@render";
import { Connection } from "@game/Server";
import { NetworkHandler } from "./NetworkHandling/networkHandler";
import { DuckGame } from "./game";
import { FrameHandler } from "./frameHandler";
import { AudioManager, Sound, SoundInfo, SoundName } from "@game/Audio";

import { Playing } from "./LoopStates/playing";
import { ScoreScreen } from "./LoopStates/scoreScreen";
import { LoadingMap } from "./LoopStates/loadingMap";
import { MainMenu } from "@menu";
import { TrophiesScreen } from "./LoopStates/trophiesScreen";

class GameLoop {
    private lastTime = 0;
    private stateMachine: StateMachine<GameLoopState>;
    private frameHandler: FrameHandler;
    private game: DuckGame;

    constructor(timer: FrameHandler) {
        this.frameHandler = timer;
        const initialState = GameLoopState.LoadingMap;
        this.stateMachine = new StateMachine(initialState);

        this.game = new DuckGame();
        this.stateMachine.addState(GameLoopState.Playing, new Playing(this.game));
        this.stateMachine.addState(GameLoopState.LoadingMap, new LoadingMap(this.game));
        this.stateMachine.addState(GameLoopState.ScoreScreen, new ScoreScreen(this.game));
        this.stateMachine.addState(GameLoopState.TrophiesScreen, new TrophiesScreen(this.game));
    }

    public async init() {
        MainMenu.get().show();
        await preloadAll();
        NetworkHandler.init(this.game);

        NetworkHandler.setOnStart(() => this.startGame());
        NetworkHandler.setOnState((state: GameLoopState) => this.stateMachine.forceState(state));
    }

    private startGame(): void {
        MainMenu.get().hide();
        this.stateMachine.enterState();
        this.frameHandler.newFrame(this.gameLoop);
    }

    private gameLoop = (currentTime: number) => {
        if (this.lastTime === 0) {
            this.lastTime = currentTime;
            this.frameHandler.newFrame(this.gameLoop);
            return;
        }
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        Render.get().clear();

        const lockState = !Connection.get().isHost();
        this.stateMachine.update(deltaTime, lockState);

        this.stateMachine.draw();
        NetworkHandler.update(deltaTime);

        this.frameHandler.newFrame(this.gameLoop);
    };
}


export { GameLoop };