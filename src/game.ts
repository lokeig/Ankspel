import { Player } from './player.ts';
import { Input } from './input.ts';
import { SpriteSheet } from "./sprite";
import { Grid, Tile } from './tile.ts';

export class Game {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    player: Player;

    constructor(canvasID: string, IMAGES: Record<string, string>, CONTROLS: Record<string, string>) {

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


        this.player = new Player({ x: 500, y: 350 }, new SpriteSheet(IMAGES.playerImage, 32), CONTROLS);


        Input.init();
        requestAnimationFrame(this.gameLoop);
    }

    private lastTime = 0;
    gameLoop = (currentTime: number) => {
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        this.update(deltaTime);
        this.draw()

        const newSet = new Set();
        for (let i = 0; i < 256; i++) {
            let top      = (i & (1 << 0)) !== 0;
            let right    = (i & (1 << 1)) !== 0;
            let bot      = (i & (1 << 2)) !== 0;
            let left     = (i & (1 << 3)) !== 0;
            let topRight = (i & (1 << 4)) !== 0;
            let topLeft  = (i & (1 << 5)) !== 0;
            let botRight = (i & (1 << 6)) !== 0;
            let botLeft =  (i & (1 << 7)) !== 0;

        
            let spriteIndex = 0;
        
            // Cardinal
            if (top)   spriteIndex += 1;
            if (right) spriteIndex += 2;
            if (bot)   spriteIndex += 4;
            if (left)  spriteIndex += 8;
        
            // Diagonals
            if (right && topRight) spriteIndex += 16;
            if (left  && topLeft ) spriteIndex += 32;
            if (right && bot && botRight) spriteIndex += 32;
            if (left  && bot && botLeft ) spriteIndex += 32;
        
            newSet.add(spriteIndex);
        }
        console.log(newSet);

        requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime: number) {
        this.player.update(deltaTime);
        const newSet = new Set()
    }
    

    

    draw(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.imageSmoothingEnabled = false;

        this.player.draw(this.ctx);
        Grid.draw(this.ctx);
    }
}