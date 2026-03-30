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

    public draw(pos: Vector, size: Vector): void {
        const scale = size.x / Cloud2Layer.size.x;
        const scaledOffset = new Vector(
            this.pos.x * scale,
            this.pos.y * scale
        );
        const drawPos = pos.add(scaledOffset);
        const buffer = 500;
        const width = Render.get().getWidth() + size.x + buffer;

        drawPos.x = (((drawPos.x % width) + width) % width) - size.x;
        Cloud2Layer.sheet.draw(drawPos, size, false, 0, zIndex.Background + 1);
    }
}

export { Cloud2Layer };