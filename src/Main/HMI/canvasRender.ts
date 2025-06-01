import { Vector } from "../Status/Common/types";
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

    draw(drawInfo: DrawInfo): void {
        const img = this.loadImage(drawInfo.imageSrc);

        if (!img.complete) {
            img.onload = () => this.draw(drawInfo);
            return;
        }

        this.ctx.save();

        if (drawInfo.flip) {
            const translateAmount = drawInfo.drawPos.x + drawInfo.drawWidth / 2
            this.ctx.translate(translateAmount, drawInfo.drawPos.y);
            this.ctx.scale(-1, 1);
            this.ctx.translate(-translateAmount, -drawInfo.drawPos.y); 
        }

        this.ctx.drawImage(    
            img,
            drawInfo.sourcePos.x, drawInfo.sourcePos.y,
            drawInfo.sourceWidth, drawInfo.sourceHeight,
            drawInfo.drawPos.x, drawInfo.drawPos.y,
            drawInfo.drawWidth, drawInfo.drawHeight
        );

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