import { Countdown, GameLoopState, IState, Lerp, SpriteSheet } from "@common";
import { DuckGame } from "../game";
import { Connection, GameMessage } from "@server";
import { MapNetworkHandler } from "../NetworkHandling/mapNetworkHandler";
import { PlayerManager } from "@player";
import { DrawTextInfo, Images, Render, RenderSpace, zIndex } from "@render";
import { Vector } from "@math";
import { MapManager } from "@game/Map";

class LoadingMap implements IState<GameLoopState> {
    private startPlayingCountdown = new Countdown(1);
    private game: DuckGame;

    private get: SpriteSheet;
    private ready: SpriteSheet;
    private doorPosition = new Lerp(0.5, this.lerp.bind(this));
    private startGame: boolean = false;

    private static doorSheetLeft = new SpriteSheet(Images.doorLeft);
    private static doorSheetRight = new SpriteSheet(Images.doorRight);

    static {
        this.doorSheetLeft.setRenderSpace(RenderSpace.Screen);
        this.doorSheetRight.setRenderSpace(RenderSpace.Screen);
    }

    private lerp(a: number, b: number, t: number): number {
        const opacThreshold = 0.3;
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

    constructor(game: DuckGame) {
        this.game = game;
        this.startPlayingCountdown.setToReady();

        MapNetworkHandler.setMapLoad((mapId: number) => {
            this.game.loadMap(mapId);
        });
        MapNetworkHandler.setMapStart(() => {
            this.startGame = true;
            this.startPlayingCountdown.reset();
            this.game.initialize();
        });
        this.ready = new SpriteSheet(Images.ready);
        this.ready.setRenderSpace(RenderSpace.Screen);

        this.get = new SpriteSheet(Images.get);
        this.get.setRenderSpace(RenderSpace.Screen);
    }

    public stateEntered(): void {
        this.startPlayingCountdown.reset();
        this.doorPosition.startLerp(0, 1);
        console.log("entered loading");
        
        Connection.get().ignoreMessage(GameMessage.PlayerDead, GameMessage.PlayerInfo);
        PlayerManager.getLocal().forEach(player => player.character.controls.addLock("loadingMap"));
        
        if (!Connection.get().isHost()) {
            return;
        }
        if (!this.game.isFinalRound()) {
            PlayerManager.getPlayers().forEach(player => player.setEnabled(true));
        }

        Connection.get().sendGameMessage(GameMessage.GameState, { state: GameLoopState.LoadingMap });

        const map = MapManager.getRandomMap();
        MapNetworkHandler.hostInitializeMap(map);
    }

    public stateUpdate(deltaTime: number) {
        this.game.update(deltaTime);

        if (this.doorPosition.isActive()) {
            this.doorPosition.update(deltaTime);
        }
        if (this.startGame) {
            this.startPlayingCountdown.update(deltaTime);
        }
    }

    public stateChange(): GameLoopState {
        if (this.startPlayingCountdown.isDone()) {
            return GameLoopState.Playing;
        }
        return GameLoopState.LoadingMap;
    }

    public stateExited(): void {
        PlayerManager.getLocal().forEach(player => player.character.controls.removeLock("loadingMap"));
        Connection.get().ignoreMessage();
        PlayerManager.reload();
        this.startGame = false;
    }

    public draw() {
        this.drawGetReadyText();
        this.game.draw();
        // this.drawDoors();
    }

    private drawDoors(): void {
        const screenHeight = Math.floor(Render.get().getHeight()) + 1;
        const screenWidth = Math.floor(Render.get().getWidth()) + 1;

        const drawWidth = (Images.doorLeft.frameWidth / Images.doorLeft.frameHeight) * screenHeight;

        let xPos = screenWidth - Math.floor(drawWidth);
        let offset: number;
        if (this.doorPosition.isActive()) {
            const extra = 13 * drawWidth / Images.doorLeft.frameWidth;
            offset = this.doorPosition.update(0) * (screenWidth / 2 + extra);
        } else {
            offset = 1;
        }
        offset -= drawWidth;
        xPos -= offset;

        LoadingMap.doorSheetRight.draw(new Vector(xPos, 0), new Vector(drawWidth, screenHeight), false, 0, zIndex.UI);
        LoadingMap.doorSheetLeft.draw(new Vector(offset, 0), new Vector(drawWidth, screenHeight), false, 0, zIndex.UI);
    }

    private drawGetReadyText(): void {
        const percent = this.startPlayingCountdown.getPercentageReady();
        const getThreshold = 0.6;
        const readyThreshold = 0.8;
        if (percent < getThreshold) {
            return;
        }
        const center = new Vector(Render.get().getWidth(), Render.get().getHeight()).divide(2);
        const scale = 12;

        if (percent > readyThreshold) {
            // Draw Ready
            const size = new Vector(Images.ready.frameWidth, Images.ready.frameHeight).multiply(scale);
            center.x -= size.x / 2;
            this.ready.draw(center, size, false, 0, zIndex.UI);
        } else {
            // Draw Get
            const size = new Vector(Images.get.frameWidth, Images.get.frameHeight).multiply(scale);
            center.x -= size.x / 2;
            this.get.draw(center, size, false, 0, zIndex.UI);
        }
    }

    private drawPlayerNames(): void {
        PlayerManager.getEnabled().forEach(player => {
            const size = 16;
            const drawPos = player.character.activeBody.pos.clone();

            drawPos.x += player.character.activeBody.width / 2;
            const textInfo: DrawTextInfo = {
                text: player.getName(),
                pos: drawPos,
                font: "chat",
                size,
                color: "white",
                opacity: 1,
                zIndex: zIndex.UI
            }

            const textDimensions = Render.get().measureText(player.getName(), "chat", size);
            drawPos.x -= textDimensions.width / 2;
            Render.get().drawText(textInfo);
        });
    }
}

export { LoadingMap };