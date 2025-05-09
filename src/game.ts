import { Player } from './player.ts';
import { Input } from './input.ts';
import { SpriteSheet } from "./sprite";
import { Grid } from './tile.ts';
import { Controls } from './types.ts';

export class Game {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    player: Player;

    constructor(canvasID: string, IMAGES: Record<string, string>, controls: Controls) {

        this.canvas = document.getElementById(canvasID) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;

        Grid.init(40);

        const iceSprite = new SpriteSheet(IMAGES.tileIce, 16);

        Grid.setArea({ x: 5,  y: 14 }, 20, 2,  iceSprite, "ICE");
        Grid.setArea({ x: 23, y: 6  }, 2,  8,  iceSprite, "ICE");
        Grid.setArea({ x: 3,  y: 6  }, 2,  8,  iceSprite, "ICE");
        Grid.setArea({ x: 9,  y: 11 }, 2,  4,  iceSprite, "ICE");
        Grid.setArea({ x: 9,  y: 5  }, 2,  4,  iceSprite, "ICE");

        Grid.setArea({ x: 5,  y: 5  }, 2,  1    ,  iceSprite, "ICE");
        Grid.setArea({ x: 15, y: 7}, 3, 3, iceSprite, "ICE");
        Grid.setTile({ x: 15, y: 6}, iceSprite, "ICE");

        this.player = new Player({ x: 500, y: 350 }, new SpriteSheet(IMAGES.playerImage, 32), controls);


        Input.init();
        requestAnimationFrame(this.gameLoop);
    }

    private lastTime = 0;
    gameLoop = (currentTime: number) => {
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        this.update(deltaTime);
        this.draw()

        requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime: number) {
        this.player.update(deltaTime);
    }
    

    draw(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.imageSmoothingEnabled = false;

        Grid.draw(this.ctx);
        this.player.draw(this.ctx);

    }
}