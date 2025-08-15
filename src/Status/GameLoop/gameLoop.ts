import { CanvasRender } from "../../HMI/canvasRender";
import { Render } from "../../HMI/render";
import { Input } from "./MainGame/Common/input";
import { SpriteSheet } from "./MainGame/Common/Sprite/sprite";
import { Controls } from "./MainGame/Common/Types/controls";
import { Vector } from "./MainGame/Common/Types/vector";
import { Glock } from "./MainGame/Objects/DynamicObjects/Items/Implementations/glock";
import { Grenade } from "./MainGame/Objects/DynamicObjects/Items/Implementations/grenade";
import { Shotgun } from "./MainGame/Objects/DynamicObjects/Items/Implementations/shotgun";
import { ItemManager } from "./MainGame/Objects/DynamicObjects/Items/Manager/itemManager";
import { PlayerManager } from "./MainGame/Objects/DynamicObjects/Player/playerManager";
import { Game } from "./MainGame/mainGame";
import { tileType } from "./MainGame/Objects/StaticObjects/tileType";
import { TileHandler } from "./MainGame/Objects/StaticObjects/tileHandler";

const controls: Controls = {
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
};

export class GameLoop {
    private lastTime = 0;

    constructor(canvasID: string) {
        Game.init(32);
        Input.init();
        Render.set(new CanvasRender(canvasID))

        this.fillArea({ x:  5,  y: 14 }, 25, 2, tileType.Ice);
        this.fillArea({ x: 23, y: 5  }, 6,  8, tileType.Ice);
        this.fillArea({ x: 3,  y: 8  }, 2,  8, tileType.Ice);
        this.fillArea({ x: 9,  y: 11 }, 2,  4, tileType.Ice);
        this.fillArea({ x: 9,  y: 5  }, 2,  4, tileType.Ice);
        this.fillArea({ x: 15, y: 7  }, 3,  3, tileType.Ice);
        this.createTile({ x: 15, y: 6 }, tileType.Ice);

        ItemManager.addItem({ x: 10, y: 2 }, Shotgun);
        ItemManager.addItem({ x: 20, y: 14 }, Shotgun);
        ItemManager.addItem({ x: 21, y: 12 }, Glock);
        ItemManager.addItem({ x: 19, y: 12 }, Grenade);

        PlayerManager.addPlayer({ x: 15, y: 11 }, controls);


        requestAnimationFrame(this.gameLoop);
    }

    gameLoop = (currentTime: number) => {
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
                
        const fixedStep = 0.1;
        const maxIterations = 20;

        let remainingDelta = deltaTime;
        let iterations = 0;

        while (remainingDelta > 0 && iterations < maxIterations) {
            
            const currentDelta = Math.min(fixedStep, remainingDelta);
            remainingDelta -= currentDelta;

            Game.update(currentDelta);

            iterations++;
        }

        Input.update();
                
        Render.get().clear();
        Render.get().drawSquare(0, 0, 2000, 2000, 0, "green")
        Render.get().setScale(1);
        Game.draw();

        requestAnimationFrame(this.gameLoop);
    }

    createTile(pos: Vector, type: tileType): void {
        const imgSrc = `/assets/tile${tileType[type]}.png`;
        TileHandler.setTile(pos, new SpriteSheet(imgSrc, 16, 16), type);
    }


    fillArea(pos: Vector, width: number, height: number, type: tileType) {
        for (let i = 0; i < width; i++) {
            const posX = pos.x + i;
            for (let j = 0; j < height; j++) {
                const posY = pos.y + j;
                this.createTile({x: posX, y: posY}, type);
            }
        }
    }
}