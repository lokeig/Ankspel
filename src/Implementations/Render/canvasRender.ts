
import { Vector } from "@math";
import { DrawInfo, Rect, IRender, ImageInfo, FontInfo, FontName } from "@render";
import { DrawLineInfo, DrawTextInfo } from "src/Render/drawInfo";
import { RenderSpace } from "src/Render/IRender";

class CanvasRender implements IRender {
    private cameraPos = new Vector;
    private cameraZoom: number = 1;

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private images: Map<string, HTMLImageElement> = new Map();
    private renderQueue: { z: number, fn: () => void }[] = [];

    constructor(canvasID: string) {
        this.canvas = document.getElementById(canvasID) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.ctx.imageSmoothingEnabled = false;
        this.canvas.style.imageRendering = "pixelated";
    }

    public async loadImage(img: ImageInfo): Promise<void> {
        if (this.images.has(img.src)) {
            return;
        }
        const HTMLImage = new Image();
        HTMLImage.src = img.src;

        await new Promise<void>((resolve, reject) => {
            HTMLImage.onload = () => resolve();
            HTMLImage.onerror = () => reject("Failed to load image: " + HTMLImage.src)
        });

        this.images.set(img.src, HTMLImage);
    }

    public async loadFont(name: FontName, font: FontInfo): Promise<void> {
        const fontFace = new FontFace(name, "url(" + font.src + ")");

        await fontFace.load();

        document.fonts.add(fontFace);
        await document.fonts.ready;
    }

    public drawImage(drawInfo: DrawInfo, space?: RenderSpace): void {
        this.renderQueue.push({ z: drawInfo.zIndex, fn: () => this.executeDrawImage(drawInfo, space) });
    }

    public drawLine(lineInfo: DrawLineInfo, space?: RenderSpace): void {
        this.renderQueue.push({ z: lineInfo.zIndex, fn: () => this.executeDrawLine(lineInfo, space) });
    }

    public drawText(textInfo: DrawTextInfo, space?: RenderSpace): void {
        this.renderQueue.push({ z: textInfo.zIndex, fn: () => this.executeDrawText(textInfo, space) });
    }

    public drawSquare(rect: Rect, zIndex: number, angle: number, color: string, space?: RenderSpace): void {
        this.renderQueue.push({ z: zIndex, fn: () => this.executeDrawSquare(rect, angle, color, space) });
    }

    public measureText(text: string, font: FontName, size: number): { width: number, height: number } {
        this.ctx.save();

        this.ctx.font = size + "px " + font;

        const metrics = this.ctx.measureText(text);
        const width = metrics.width;
        const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        this.ctx.restore();

        return { width, height };
    }

    public render(): void {
        this.renderQueue.sort((a, b) => a.z - b.z);
        this.renderQueue.forEach(({ fn }) => fn());
        this.renderQueue.length = 0;
    }

    private executeDrawImage(drawInfo: DrawInfo, space?: RenderSpace): void {
        const img = this.images.get(drawInfo.image.src);
        if (!img) {
            console.error("Image " + drawInfo.image.src + " not loaded before use");
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
            Math.floor(drawInfo.source.x),
            Math.floor(drawInfo.source.y),
            Math.floor(drawInfo.source.width),
            Math.floor(drawInfo.source.height),
            Math.floor(-drawInfo.world.width / 2),
            Math.floor(-drawInfo.world.height / 2),
            Math.floor(drawInfo.world.width),
            Math.floor(drawInfo.world.height),
        );

        this.ctx.restore();
    }

    public executeDrawLine(info: DrawLineInfo, space?: RenderSpace): void {
        const img = this.images.get(info.image.src);
        if (!img) {
            console.error("Image not loaded before use!");
            return;
        }

        const dx = Math.floor(info.end.x - info.start.x);
        const dy = Math.floor(info.end.y - info.start.y);
        const length = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);

        this.ctx.save();
        if (space === RenderSpace.Screen) {
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        this.ctx.globalAlpha = info.opacity;
        this.ctx.translate(info.start.x, info.start.y);
        this.ctx.rotate(angle);

        this.ctx.drawImage(
            img,
            info.sourceRect.x, info.sourceRect.y,
            info.sourceRect.width, info.sourceRect.height,
            0, -info.width / 2,
            length, info.width
        );

        this.ctx.restore();
    }

    public executeDrawSquare(rect: Rect, angle: number, color: string, space?: RenderSpace): void {
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

    public executeDrawText(info: DrawTextInfo, space?: RenderSpace): void {
        this.ctx.save();
        if (space === RenderSpace.Screen) {
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        this.ctx.globalAlpha = info.opacity;

        this.ctx.font = info.size + "px " + info.font;
        this.ctx.fillStyle = info.color;

        this.ctx.fillText(info.text, Math.floor(info.pos.x), Math.floor(info.pos.y));

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