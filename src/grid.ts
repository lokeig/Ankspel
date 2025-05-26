import { ItemHandler } from "./itemHandler";
import { TileManager } from "./tileManager";

export class Grid {

    public static tileManager: TileManager;
    public static itemManager: ItemHandler;

    public static gridSize: number;
    
    static init(size: number) {
        this.gridSize = size;
        this.tileManager = new TileManager(size);
        this.itemManager = new ItemHandler(size);
    }

    static update(deltaTime: number) {
        this.itemManager.update(deltaTime);
    }

    static draw(ctx: CanvasRenderingContext2D) {
        this.tileManager.draw(ctx);
        this.itemManager.draw(ctx);
    }
}