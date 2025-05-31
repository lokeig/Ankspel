import { images } from "./images";
import { Input } from "./Status/Common/input";
import { SpriteSheet } from "./Status/Common/sprite";
import { Controls, Vector } from "./Status/Common/types";
import { Grid } from "./Status/Grid/grid";
import { tileType } from "./Status/StaticObjects/tile";


const controls: Controls = {
    jump: " ", // SPACEBAR

    left: "a",
    right: "d",
    down: "s",
    up: "w",

    shoot: "r",
    pickup: "e",
};

export class Game {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    constructor(canvasID: string) {

        this.canvas = document.getElementById(canvasID) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.ctx.imageSmoothingEnabled = false;

        Grid.init(32);
        Input.init();

        this.fillArea({ x:  5,  y: 14 }, 25, 2, tileType.Ice);
        this.fillArea({ x: 23, y: 5  }, 6,  8, tileType.Ice);
        this.fillArea({ x: 3,  y: 8  }, 2,  8, tileType.Ice);
        this.fillArea({ x: 9,  y: 11 }, 2,  4, tileType.Ice);
        this.fillArea({ x: 9,  y: 5  }, 2,  4, tileType.Ice);
        this.fillArea({ x: 15, y: 7  }, 3,  3, tileType.Ice);
        this.createTile({ x: 15, y: 6}, tileType.Ice);

        Grid.itemHandler.addShotgun({ x: 10, y: 2 }, images.shotgun)
        Grid.itemHandler.addShotgun({ x: 20, y: 2 }, images.shotgun)

        Grid.playerHandler.addPlayer({ x: 13, y: 11 }, controls, images.playerImage);

        requestAnimationFrame(this.gameLoop);
    }

    private lastTime = 0;
    gameLoop = (currentTime: number) => {
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.draw();

        Input.update();

        requestAnimationFrame(this.gameLoop);
    }

    createTile(pos: Vector, type: tileType): void {
        const imgSrc = `/assets/tile${tileType[type]}.png`;
        Grid.tileHandler.setTile(pos, new SpriteSheet(imgSrc, 16), type);
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

    update(deltaTime: number) {
        Grid.update(deltaTime);
    }
    
    
    draw(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();

        // this.ctx.translate(0, 0);

        // const angle = 0;
        // this.ctx.rotate(angle*Math.PI/180);

        // const scaleFactor = 1;
        // this.ctx.scale(scaleFactor, scaleFactor);

        Grid.draw(this.ctx);

        this.ctx.restore();
    }
}