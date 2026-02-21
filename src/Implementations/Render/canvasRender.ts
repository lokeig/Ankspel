
import { Vector } from "@math";
import { DrawInfo, Rect, IRender } from "@render";
import { RenderSpace } from "src/Render/IRender";

class CanvasRender implements IRender {
    private cameraPos = new Vector;
    private cameraZoom: number = 1;

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

    public draw(drawInfo: DrawInfo, space?: RenderSpace): void {
        const img = this.loadImage(drawInfo.imageSrc);
        if (!img.complete) {
            img.onload = () => this.draw(drawInfo, space);
            return;
        }
        this.ctx.save();
        if (space === RenderSpace.Screen) {
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        this.ctx.globalAlpha = drawInfo.opacity;

        if (drawInfo.flip) {
            const translateAmount = Math.floor(drawInfo.world.x + drawInfo.world.width / 2)
            this.ctx.translate(translateAmount, Math.floor(drawInfo.world.y));
            this.ctx.scale(-1, 1);
            this.ctx.translate(-translateAmount, - Math.floor(drawInfo.world.y));
        }

        this.ctx.translate(Math.floor(drawInfo.world.x + drawInfo.world.width / 2), Math.floor(drawInfo.world.y + drawInfo.world.height / 2));
        this.ctx.rotate(drawInfo.angle);

        this.ctx.drawImage(
            img,
            Math.floor(drawInfo.source.x), Math.floor(drawInfo.source.y),
            Math.floor(drawInfo.source.width), Math.floor(drawInfo.source.height),
            -drawInfo.world.width / 2, -drawInfo.world.height / 2,
            drawInfo.world.width, drawInfo.world.height
        );

        this.ctx.restore();
    }

    public drawLine(imageSrc: string, start: Vector, end: Vector, width: number, sourceRect: Rect, opacity: number, space?: RenderSpace): void {
        const img = this.loadImage(imageSrc);
        if (!img.complete) {
            img.onload = () => this.drawLine(imageSrc, start, end, width, sourceRect, opacity, space);
            return;
        }

        const dx = Math.floor(end.x - start.x);
        const dy = Math.floor(end.y - start.y);
        const length = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);

        this.ctx.save();
        if (space === RenderSpace.Screen) {
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        this.ctx.globalAlpha = opacity;
        this.ctx.translate(start.x, start.y);
        this.ctx.rotate(angle);

        this.ctx.drawImage(
            img,
            sourceRect.x, sourceRect.y,
            sourceRect.width, sourceRect.height,
            0, -width / 2,
            length, width
        );

        this.ctx.restore();
    }

    public drawSquare(rect: Rect, angle: number, color: string, space?: RenderSpace): void {
        this.ctx.save();
        if (space === RenderSpace.Screen) {
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        this.ctx.fillStyle = color;
        this.ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);
        this.ctx.rotate(angle);

        this.ctx.fillRect(-rect.width / 2, -rect.height / 2, rect.width, rect.height);

        this.ctx.restore();
    }

    public clear() {
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();    
    }

    public setCamera(pos: Vector, zoom: number): void {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);

        const newWidth = this.canvas.width / zoom;
        const newHeight = this.canvas.height / zoom;

        const xOffset = newWidth / 2 - pos.x;
        const yOffset = newHeight / 2 - pos.y;

        this.ctx.scale(zoom, zoom);
        this.ctx.translate(xOffset, yOffset);

        this.cameraPos = pos.clone();
        this.cameraZoom = zoom;
    }

    public getCameraPos(): Vector {
        return this.cameraPos;
    }

    public getCameraZoom(): number {
        return this.cameraZoom;
    }

    public getWidth(): number {
        return this.canvas.width;
    }

    public getHeight(): number {
        return this.canvas.height;
    }
}

export { CanvasRender };