import { ItemManager } from "./Objects/DynamicObjects/Items/Manager/itemManager";
import { PlayerManager } from "./Objects/DynamicObjects/Player/playerManager";
import { ProjectileManager } from "./Objects/DynamicObjects/Projectiles/projectileManager";
import { TileHandler } from "./Objects/StaticObjects/tileHandler";
import { ParticleHandler } from "./Particles/particleHandler";
import { Vector } from "./Common/Types/vector";
import { tileType } from "./Objects/StaticObjects/tileType";
import { Controls } from "./Common/Types/controls";
import { Shotgun } from "./Objects/DynamicObjects/Items/Implementations/shotgun";
import { Glock } from "./Objects/DynamicObjects/Items/Implementations/glock";
import { Grenade } from "./Objects/DynamicObjects/Items/Implementations/grenade";
import { StateInterface } from "./Common/StateMachine/stateInterface";
import { GameLoopState } from "../gameLoopState";
import { Level } from "./level";
import { GameServer } from "../Server/Common/server";

export class InMatchLoop implements StateInterface<GameLoopState> {
    private controls: Controls = {
        jump: " ",
        left: "a",
        right: "d",
        down: "s",
        up: "w",

        shoot: "ArrowLeft",
        pickup: "ArrowUp",
        ragdoll: "e",
        strafe: "l",
        menu: "esc"
    }

    private startLevel = new Level("starter");

    public stateEntered(): void {
        this.fillArea({ x: 5, y: 14 }, 25, 2, tileType.Ice);
        this.fillArea({ x: 23, y: 5 }, 6, 8, tileType.Ice);
        this.fillArea({ x: 3, y: 8 }, 2, 8, tileType.Ice);
        this.fillArea({ x: 9, y: 11 }, 2, 4, tileType.Ice);
        this.fillArea({ x: 9, y: 5 }, 2, 4, tileType.Ice);
        this.fillArea({ x: 15, y: 7 }, 3, 3, tileType.Ice);

        this.createTile({ x: 15, y: 6 }, tileType.Ice);

        ItemManager.addItem({ x: 10, y: 2 }, Shotgun);
        ItemManager.addItem({ x: 20, y: 14 }, Shotgun);
        ItemManager.addItem({ x: 21, y: 12 }, Glock);
        ItemManager.addItem({ x: 19, y: 12 }, Grenade);

        const id = GameServer.get().getID()!;
        console.log("Created Player with ID:", id)
        PlayerManager.addPlayer({ x: 15, y: 11 }, this.controls, id);


        this.loadLevel(this.startLevel)
    }

    public stateUpdate(deltaTime: number) {
        ItemManager.update(deltaTime);
        PlayerManager.update(deltaTime);
        ProjectileManager.update(deltaTime);
        ParticleHandler.update(deltaTime);
    }

    public stateChange(): GameLoopState {
        return GameLoopState.inMatch;
    }

    public stateExited(): void {

    }

    public stateDraw() {
        ProjectileManager.draw();
        ItemManager.draw();
        PlayerManager.draw();
        TileHandler.draw();
        ParticleHandler.draw();
    }

    public loadLevel(lvl: Level) {
        TileHandler.clear();
        for (const tile of lvl.getTiles().values()) {
            TileHandler.setTile(tile.pos, tile.type);
        }
    }

    private createTile(pos: Vector, type: tileType): void {
        this.startLevel.getTiles().push({ pos, type });
    }


    private fillArea(pos: Vector, width: number, height: number, type: tileType) {
        for (let i = 0; i < width; i++) {
            const posX = pos.x + i;
            for (let j = 0; j < height; j++) {
                const posY = pos.y + j;
                this.createTile({ x: posX, y: posY }, type);
            }
        }
    }

}