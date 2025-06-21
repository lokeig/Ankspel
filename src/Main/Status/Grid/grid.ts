import { ItemHandler } from "./itemHandler";
import { TileHandler } from "./tileHandler";
import { PlayerHandler } from "./playerHandler";
import { ProjectileHandler } from "./projectileHandler";
import { ParticleHandler } from "./particleHandler";

export class Grid {

    public static gridSize: number;
    
    static init(size: number) {
        this.gridSize = size;
        TileHandler.init(size);
        ItemHandler.init(size);
        PlayerHandler.init(size);
        ProjectileHandler.init(size);
    }

    static update(deltaTime: number) {
        ItemHandler.update(deltaTime);
        PlayerHandler.update(deltaTime);
        ProjectileHandler.update(deltaTime);
        ParticleHandler.update(deltaTime);
    }

    static draw() {
        ProjectileHandler.draw();
        ItemHandler.draw();
        PlayerHandler.draw();
        TileHandler.draw();
        ParticleHandler.draw();
    }
}