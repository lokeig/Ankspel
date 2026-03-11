import { SpriteSheet } from "@common";
import { ParallaxLayer } from "@game/ParallaxBackground/parallaxLayer";
import { Vector } from "@math";
import { Images, RenderSpace } from "@render";

class Cloud1Layer implements ParallaxLayer {
    private static sheet = new SpriteSheet(Images.cloud1);
    private static size = new Vector(Images.cloud1.frameWidth, Images.cloud1.frameHeight);

    private pos = new Vector(0, -50);
    private static speed = 25;

    static {
        this.sheet.setRenderSpace(RenderSpace.Screen);
    }

    public update(deltaTime: number): void {
        this.pos.x += (deltaTime * Cloud1Layer.speed);
    }

    public getZoomFactor(): number {
        return 4;
    }

    public getWidth(): number {
        return Cloud1Layer.size.x;
    }

    public getHeight(): number {
        return Cloud1Layer.size.y;
    }

    public getParallaxFactor(): number {
        return 0.6;
    }

    public draw(pos: Vector, zoom: number): void {
        // const scaledSize = Cloud1Layer.size.clone().multiply(zoom);
        Cloud1Layer.sheet.draw(pos.add(this.pos), zoom, false, 0);

    }
}

export { Cloud1Layer };