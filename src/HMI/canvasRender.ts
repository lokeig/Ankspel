import { GameObject } from "../Status/Game/Objects/Common/gameObject";
import { Vector } from "../Status/Game/Common/Types/vector";
import { DrawInfo, RenderIF } from "./renderInterface";

export class CanvasRender implements RenderIF {

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    images: Map<string, HTMLImageElement> = new Map();

    constructor(canvasID: string) {
        this.canvas = document.getElementById(canvasID) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.ctx.imageSmoothingEnabled = false;
    }

    private loadImage(src: string): HTMLImageElement {
        if (!this.images.has(src)) {
            const img = new Image();
            img.src = src;
            this.images.set(src, img);
        }
        return this.images.get(src)!;
    }

    public draw(drawInfo: DrawInfo): void {
        const img = this.loadImage(drawInfo.imageSrc);

        if (!img.complete) {
            img.onload = () => this.draw(drawInfo);
            return;
        }

        this.ctx.save();

        if (drawInfo.flip) {
            const translateAmount = Math.floor(drawInfo.drawPos.x + drawInfo.drawWidth / 2)
            this.ctx.translate(translateAmount, Math.floor(drawInfo.drawPos.y));
            this.ctx.scale(-1, 1);
            this.ctx.translate(-translateAmount, - Math.floor(drawInfo.drawPos.y)); 
        }

        this.ctx.translate(Math.floor(drawInfo.drawPos.x + drawInfo.drawWidth / 2), Math.floor(drawInfo.drawPos.y + drawInfo.drawHeight / 2));     
        this.ctx.rotate(drawInfo.angle);

        const inset = 0.2;
        this.ctx.drawImage(
            img,
            Math.floor(drawInfo.sourcePos.x) + inset, Math.floor(drawInfo.sourcePos.y) + inset,
            Math.floor(drawInfo.sourceWidth) - 2 * inset, Math.floor(drawInfo.sourceHeight) - 2 * inset,
            -drawInfo.drawWidth / 2, -drawInfo.drawHeight / 2,
            drawInfo.drawWidth, drawInfo.drawHeight
        );

        this.ctx.restore();
    }

    public drawLine(imageSrc: string, pos1: Vector, pos2: Vector, width: number, sourceRect: GameObject) {

        const img = this.loadImage(imageSrc);
        if (!img.complete) {
            img.onload = () => this.drawLine(imageSrc, pos1, pos2, width, sourceRect);
            return;
        }
        const dx = Math.floor(pos2.x - pos1.x);
        const dy = Math.floor(pos2.y - pos1.y);
        const length = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx); 

        this.ctx.save();
        this.ctx.translate(pos1.x, pos1.y);
        this.ctx.rotate(angle);

        this.ctx.drawImage(
            img, 
            sourceRect.pos.x, sourceRect.pos.y, 
            sourceRect.width, sourceRect.height,
            0, -width / 2,
            length, width
        );

        this.ctx.restore();
    }

    public drawSquare(x: number, y: number, width: number, height: number, angle: number, color: string) {
        this.ctx.save();

        this.ctx.fillStyle = color;
        this.ctx.translate(x + width/2, y + height/2);     
        this.ctx.rotate(angle);

        this.ctx.fillRect(-width/2, -height/2, width, height); 

        this.ctx.restore();
    }

    public clear() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public setScale(scale: number) {
        const xOffset = (this.canvas.width - this.canvas.width / scale) / 2;
        const yOffset = (this.canvas.height - this.canvas.height / scale) / 2;     
        this.ctx.scale(scale, scale);
        this.ctx.translate(-xOffset, -yOffset);

    }

    public setPosition(pos: Vector) {
        this.ctx.translate(pos.x, pos.y);
    }
}