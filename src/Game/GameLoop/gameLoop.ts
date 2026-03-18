import { StateMachine, Input } from "@common";
import { ImageName, Images, Render } from "@render";
import { MainMenu } from "@game/Server";
import { NetworkHandler } from "./NetworkHandling/networkHandler";
import { DuckGame } from "./game";
import { FrameHandler } from "./frameTimer";
import { Sound, SoundInfo, SoundName } from "@game/Audio";
import { AudioManager } from "@game/Audio/audioManager";

import { GameLoopState } from "./gameLoopState";
import { Playing } from "./LoopStates/playing";
import { ScoreScreen } from "./LoopStates/scoreScreen";
import { LoadingMap } from "./LoopStates/loadingMap";
import { FontName, Fonts } from "src/Render/fonts";

class GameLoop {
    private lastTime = 0;
    private stateMachine: StateMachine<GameLoopState>;
    private frameHandler: FrameHandler;
    private game: DuckGame;

    constructor(timer: FrameHandler) {
        this.frameHandler = timer;
        const initalState = GameLoopState.LoadingMap;
        this.stateMachine = new StateMachine(initalState);

        this.game = new DuckGame();
        this.stateMachine.addState(GameLoopState.Playing, new Playing(this.game));
        this.stateMachine.addState(GameLoopState.LoadingMap, new LoadingMap(this.game));
        this.stateMachine.addState(GameLoopState.ScoreScreen, new ScoreScreen(this.game));

    }

    public async init() {
        MainMenu.get().show();
        await this.preloadAllImages();
        await this.preloadAllAudio();
        await this.preloadAllFonts();
        NetworkHandler.init(this.game);

        NetworkHandler.setOnStart(() => { this.startGame(); });
    }

    private async preloadAllImages(): Promise<void> {
        const keys = Object.keys(Images) as ImageName[];

        for (const key of keys) {
            const imageInfo = Images[key];
            await Render.get().loadImage(imageInfo);
        }
    }

    private async preloadAllFonts(): Promise<void> {
        const keys = Object.keys(Fonts) as FontName[];

        for (const key of keys) {
            const fontInfo = Fonts[key];
            await Render.get().loadFont(key, fontInfo);
        }
    }

    private async preloadAllAudio(): Promise<void> {
        const keys = Object.keys(Sound) as SoundName[];

        for (const key of keys) {
            const src = SoundInfo[key].src;
            await AudioManager.get().load(key, src);
        }
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

        this.stateMachine.update(deltaTime);

        this.stateMachine.draw();
        Input.update();
        NetworkHandler.update(deltaTime);

        this.frameHandler.newFrame(this.gameLoop);
    };
}


export { GameLoop };