import { Player } from './player.ts';
import { Input } from './input.ts';
import { SpriteSheet } from "./sprite";
import { Grid, Tile } from './tile.ts';
import { Vector } from './types.ts';
import { GameObject } from './gameobject.ts';

export class Game {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    player: Player;
    grid: Grid;

    constructor(canvasID: string, IMAGES: Record<string, string>, CONTROLS: Record<string, string>) {

        this.canvas = document.getElementById(canvasID) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;

        this.grid = new Grid(40);

        const iceSprite = new SpriteSheet(IMAGES.tileIce, 32, 32);

        this.grid.setArea({ x: 5, y: 14 }, 20, 2, iceSprite, "ICE");
        this.grid.setArea({ x: 23, y: 6 }, 2, 8, iceSprite, "ICE");
        this.grid.setArea({ x: 3, y: 13 }, 2, 1, iceSprite, "ICE");
        this.grid.setArea({ x: 3, y: 11 }, 15, 1, iceSprite, "ICE");



        this.player = new Player({ x: 500, y: 350 }, 35, 68, new SpriteSheet(IMAGES.playerImage, 32, 32), 96, CONTROLS);


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
        this.handleCollisions(deltaTime);
    }


    handleCollisions(deltaTime: number) {
        this.player.grounded = false;
    }

    draw(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.imageSmoothingEnabled = false;

        this.player.draw(this.ctx);
        this.grid.draw(this.ctx);
    }
}