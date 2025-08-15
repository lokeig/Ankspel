import { ItemManager } from "./Objects/DynamicObjects/Items/Manager/itemManager";
import { PlayerManager } from "./Objects/DynamicObjects/Player/playerManager";
import { ProjectileManager } from "./Objects/DynamicObjects/Projectiles/projectileManager";
import { Grid } from "./Common/grid";
import { TileHandler } from "./Objects/StaticObjects/tileHandler";
import { ParticleHandler } from "./Particles/particleHandler";

export class Game {

    static init(size: number) {
        Grid.gridSize = size;
    }

    static update(deltaTime: number) {
        ItemManager.update(deltaTime);
        PlayerManager.update(deltaTime);
        ProjectileManager.update(deltaTime);
        ParticleHandler.update(deltaTime);
    }

    static draw() {
        ProjectileManager.draw();
        ItemManager.draw();
        PlayerManager.draw();
        TileHandler.draw();
        ParticleHandler.draw();
    }
}