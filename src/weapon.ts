import { Cooldown } from "./cooldown";
import { Item } from "./item";
import { SpriteSheet } from "./sprite";
import { Vector } from "./types";

export class Shotgun extends Item {

    private bulletFireAmount: number = 7;
    private bulletAngleVariation: number = 30;
    private bulletSpeed: number = 5;
    private knockbackAmount: number = 0;
    private reloadTime = new Cooldown(2);

    private maxAmmo: number = 10;
    private usedAmmo: number = 0;

    private handOffset: Vector = { x: 0, y: 0 };
    private loaded: boolean = true;
    
    constructor(pos: Vector, spriteSheet: SpriteSheet){
        super(pos, 50, 15, spriteSheet, 64)
        this.drawCol = 0;
        this.drawRow = 0;
    }

    public interact(): void {
        if (this.loaded) {
            this.shoot();
        } else {
            this.reload();
        }
    };

    itemUpdate(deltaTime: number): void {
        this.reloadTime.update(deltaTime);
    }

    private shoot(): void {
        if (this.usedAmmo > this.maxAmmo) {
            return;
        }
        this.knockback(0);
        this.usedAmmo += 1;
        this.loaded = false;
    }

    private reload() {
        this.reloadTime.reset();
    }

    public knockback(angle: number): void {
        if (this.owner) {
            this.owner.velocity.x -= this.knockbackAmount;
        } else {
            this.velocity.x -= this.knockbackAmount;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "green";
        ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);

        const flip = this.direction === "left";

        const drawPosX = this.pos.x + ((this.width  - this.drawSize) / 2);
        const drawPosY = this.pos.y + ((this.height - this.drawSize) / 2);

        this.spriteSheet.draw(ctx, 0, 0, { x: drawPosX, y: drawPosY }, this.drawSize, flip);
        this.spriteSheet.draw(ctx, 1, 0, { x: drawPosX, y: drawPosY }, this.drawSize, flip);
    }
}