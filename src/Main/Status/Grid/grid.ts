import { ItemHandler } from "./itemHandler";
import { TileHandler } from "./tileHandler";
import { PlayerHandler } from "./playerHandler";

export class Grid {

    public static gridSize: number;
    
    static init(size: number) {
        this.gridSize = size;
        TileHandler.init(size);
        ItemHandler.init(size);
        PlayerHandler.init(size)
    }

    static update(deltaTime: number) {
        ItemHandler.update(deltaTime);
        PlayerHandler.update(deltaTime)
    }

    static draw() {
        PlayerHandler.draw();
        ItemHandler.draw();
        TileHandler.draw();
    }
}