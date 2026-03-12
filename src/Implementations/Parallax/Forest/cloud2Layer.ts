import { SpriteSheet } from "@common";
import { ParallaxLayer } from "@game/ParallaxBackground/parallaxLayer";
import { Vector } from "@math";
import { Images, RenderSpace } from "@render";

class Cloud2Layer implements ParallaxLayer {
    private static sheet = new SpriteSheet(Images.cloud2);
    private static size = new Vector(Images.cloud2.frameWidth, Images.cloud2.frameHeight);

    private pos = new Vector(-50, -70);
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

    public getParallaxFactor(): number {
        return 0.6;
    }

    public shouldClampToScreen(): boolean {
        return false;
    }

    public draw(pos: Vector, size: Vector): void {

        const scale = size.x / Cloud2Layer.size.x;
        const scaledOffset = new Vector(
            this.pos.x * scale,
            this.pos.y * scale
        );

        Cloud2Layer.sheet.draw(pos.add(scaledOffset), size, false, 0);
    }
}

export { Cloud2Layer };