import { ItemHandler } from "./itemHandler";
import { TileHandler } from "./tileHandler";
import { PlayerHandler } from "./playerHandler";
import { ProjectileHandler } from "./projectileHandler";
import { ParticleHandler } from "./particleHandler";
import { GridHelper } from "./gridHelper";

export class Grid {

    
    static init(size: number) {
        GridHelper.gridSize = size;
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