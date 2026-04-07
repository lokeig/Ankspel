import { SpriteSheet } from "@common";
import { ParallaxLayer } from "@game/ParallaxBackground/parallaxLayer";
import { Vector } from "@math";
import { Images, Render, RenderSpace, zIndex } from "@render";

class Cloud2Layer implements ParallaxLayer {
    private static sheet = new SpriteSheet(Images.cloud2);
    private static size = new Vector(Images.cloud2.frameWidth, Images.cloud2.frameHeight);

    private pos = new Vector(50, -30);
    private static speed = 7;

    static {
        this.sheet.setRenderSpace(RenderSpace.Screen);
    }

    public update(deltaTime: number): void {
        this.pos.x += (deltaTime * Cloud2Layer.speed);
    }

    public getZoomFactor(): number {
        return 1.4;
    }

    public getWidth(): number {
        return Cloud2Layer.size.x;
    }

    public getHeight(): number {
        return Cloud2Layer.size.y;
    }

    public tiles(): boolean {
        return false;
    }

    public getParallaxFactor(): number {
        return 0.6;
    }

    private getDrawPos(pos: Vector, size: Vector): Vector {
        const scale = size.x / Cloud2Layer.size.x;
        const scaledOffset = new Vector(
            this.pos.x * scale,
            this.pos.y * scale
        );
        return pos.add(scaledOffset);
    }

    public draw(pos: Vector, size: Vector): void {
        const drawPos = this.getDrawPos(pos, size);
        const buffer = 100;
        const width = Render.get().getWidth() + buffer;
        if (drawPos.x > width) {
            const scale = size.x / Cloud2Layer.size.x;

            this.pos.x -= width / scale;
            this.pos.x -= size.x / scale;
        }
        Cloud2Layer.sheet.draw(drawPos, size, false, 0, zIndex.Background + 1);
    }
}

export { Cloud2Layer };