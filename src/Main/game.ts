import { CanvasRender } from "./HMI/canvasRender";
import { Render } from "./HMI/render";
import { Input } from "./Status/Common/input";
import { SpriteSheet } from "./Status/Common/sprite";
import { Controls, Vector } from "./Status/Common/types";
import { Glock } from "./Status/DynamicObjects/Items/glock";
import { Grenade } from "./Status/DynamicObjects/Items/grenade";
import { Shotgun } from "./Status/DynamicObjects/Items/shotgun";
import { Grid } from "./Status/Grid/grid";
import { ItemHandler } from "./Status/Grid/itemHandler";
import { PlayerHandler } from "./Status/Grid/playerHandler";
import { TileHandler } from "./Status/Grid/tileHandler";
import { tileType } from "./Status/StaticObjects/tile";


const controls: Controls = {
    jump: " ", // SPACEBAR

    left: "a",
    right: "d",
    down: "s",
    up: "w",

    shoot: "ArrowLeft",
    pickup: "ArrowUp",
};

export class Game {
    constructor(canvasID: string) {
        Grid.init(32);
        Input.init();
        Render.set(new CanvasRender(canvasID))

        this.fillArea({ x:  5,  y: 14 }, 25, 2, tileType.Ice);
        this.fillArea({ x: 23, y: 5  }, 6,  8, tileType.Ice);
        this.fillArea({ x: 3,  y: 8  }, 2,  8, tileType.Ice);
        this.fillArea({ x: 9,  y: 11 }, 2,  4, tileType.Ice);
        this.fillArea({ x: 9,  y: 5  }, 2,  4, tileType.Ice);
        this.fillArea({ x: 15, y: 7  }, 3,  3, tileType.Ice);
        this.createTile({ x: 15, y: 6 }, tileType.Ice);

        ItemHandler.addItem({ x: 10, y: 2 }, Shotgun);
        ItemHandler.addItem({ x: 20, y: 14 }, Shotgun);
        ItemHandler.addItem({ x: 21, y: 12 }, Glock);
        ItemHandler.addItem({ x: 19, y: 12 }, Grenade);

        PlayerHandler.addPlayer({ x: 15, y: 11 }, controls);


        requestAnimationFrame(this.gameLoop);
    }

    private scaleFactor: number = 1;
    private lastTime = 0;
    gameLoop = (currentTime: number) => {
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        Grid.update(deltaTime);
        Input.update();

        this.scaleFactor += deltaTime * 0.1;
        
        
        Render.get().clear();
        Render.get().drawSquare(0, 0, 2000, 2000, 0, "grey")
        Render.get().setScale(1);
        Grid.draw();

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