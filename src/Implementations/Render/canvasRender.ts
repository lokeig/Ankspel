
import { DrawInfo, Rect, RenderIF } from "@render";

class CanvasRender implements RenderIF {

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

    public drawLine(imageSrc: string, x1: number, y1: number, x2: number, y2: number, width: number, sourceRect: Rect): void {

        const img = this.loadImage(imageSrc);
        if (!img.complete) {
            img.onload = () => this.drawLine(imageSrc, x1, y1, x2, y2, width, sourceRect);
            return;
        }
        const dx = Math.floor(x2 - x1);
        const dy = Math.floor(y2 - y1);
        const length = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);

        this.ctx.save();
        this.ctx.translate(x1, y1);
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

    drawSquare(rect: Rect, angle: number, color: string): void {
        this.ctx.save();

        this.ctx.fillStyle = color;
        this.ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);
        this.ctx.rotate(angle);

        this.ctx.fillRect(-rect.width / 2, -rect.height / 2, rect.width, rect.height);

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
}

export { CanvasRender };