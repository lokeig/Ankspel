import { StateMachine, Input } from "@common";
import { ImageName, Images, Render } from "@render";
import { LobbyList } from "@game/Server";
import { GameLoopState } from "./gameLoopState";
import { Playing } from "./LoopStates/playing";
import { NetworkHandler } from "./NetworkHandling/networkHandler";
import { LoadingMap } from "./LoopStates/loadingMap";
import { DuckGame } from "./game";
import { FrameHandler } from "./frameTimer";

class GameLoop {
    private lastTime = 0;
    private stateMachine: StateMachine<GameLoopState>;
    private frameHandler: FrameHandler;

    constructor(timer: FrameHandler) {
        this.frameHandler = timer;
        const initalState = GameLoopState.LoadingMap;
        this.stateMachine = new StateMachine(initalState);
    
        const game = new DuckGame();
        this.stateMachine.addState(GameLoopState.Playing, new Playing(game));
        this.stateMachine.addState(GameLoopState.LoadingMap, new LoadingMap(game));
    }
    
    public async init() {
        await this.preloadAllImages();

        NetworkHandler.init();
        LobbyList.get().show();
    
        NetworkHandler.setOnStart(() => { this.startGame(); });        
    }

    private async preloadAllImages(): Promise<void> {
        const keys = Object.keys(Images) as ImageName[];

        for (const key of keys) {
            const imageInfo = Images[key];
            await Render.get().loadImage(imageInfo); 
        }
    }

    private startGame(): void {
        LobbyList.get().hide();
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