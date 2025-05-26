import { Player } from './Player/player.ts';
import { Input } from './input.ts';
import { SpriteSheet } from "./sprite";
import { Controls, Vector } from './types.ts';
import { Grid } from './grid.ts';
import { tileType } from './tile.ts';
import { Shotgun } from './weapon.ts';
import { images } from './images.ts';

export class Game {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    player: Player;

    constructor(canvasID: string, controls: Controls) {

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

        const shotgun = new Shotgun({ x: 150, y: 0 }, new SpriteSheet(images.shotgun, 32));
        Grid.itemManager.addItem(shotgun);

        this.player = new Player({ x: 500, y: 350 }, new SpriteSheet(images.playerImage, 32), controls);

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
        Grid.tileManager.setTile(pos, new SpriteSheet(imgSrc, 16), type);
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
        this.player.update(deltaTime);
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

        this.player.draw(this.ctx);
        Grid.draw(this.ctx);

        this.ctx.restore();
    }
}