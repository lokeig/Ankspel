import { SpriteSheet } from "@common";
import { ParallaxLayer } from "@game/ParallaxBackground/parallaxLayer";
import { Vector } from "@math";
import { Images, RenderSpace, zIndex } from "@render";

class Cloud1Layer implements ParallaxLayer {
    private static sheet = new SpriteSheet(Images.cloud1);
    private static size = new Vector(Images.cloud1.frameWidth, Images.cloud1.frameHeight);

    private pos = new Vector(0, -50);
    private static speed = 5;

    static {
        this.sheet.setRenderSpace(RenderSpace.Screen);
    }

    public update(deltaTime: number): void {
        this.pos.x += (deltaTime * Cloud1Layer.speed);
    }

    public getZoomFactor(): number {
        return 1.25;
    }

    public getWidth(): number {
        return Cloud1Layer.size.x;
    }

    public getHeight(): number {
        return Cloud1Layer.size.y;
    }

    public getParallaxFactor(): number {
        return 0.4;
    }

    public shouldClampToScreen(): boolean {
        return false;
    }

    public draw(pos: Vector, size: Vector): void {

        const scale = size.x / Cloud1Layer.size.x;
        const scaledOffset = new Vector(
            this.pos.x * scale,
            this.pos.y * scale
        );

        Cloud1Layer.sheet.draw(pos.add(scaledOffset), size, false, 0, zIndex.Background + 1);
    }
}

export { Cloud1Layer };