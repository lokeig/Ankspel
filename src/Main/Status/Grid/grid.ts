import { ItemHandler } from "./itemHandler";
import { TileHandler } from "./tileHandler";
import { PlayerHandler } from "./playerHandler";

export class Grid {

    public static tileHandler: TileHandler;
    public static itemHandler: ItemHandler;
    public static playerHandler: PlayerHandler;

    public static gridSize: number;
    
    static init(size: number) {
        this.gridSize = size;
        this.tileHandler = new TileHandler(size);
        this.itemHandler = new ItemHandler(size);
        this.playerHandler = new PlayerHandler(size);
    }

    static update(deltaTime: number) {
        this.itemHandler.update(deltaTime, this.tileHandler);
        this.playerHandler.update(deltaTime, this.tileHandler, this.itemHandler)
    }

    static draw(ctx: CanvasRenderingContext2D) {
        this.itemHandler.draw(ctx);
        this.playerHandler.draw(ctx);
        this.tileHandler.draw(ctx);
    }
}