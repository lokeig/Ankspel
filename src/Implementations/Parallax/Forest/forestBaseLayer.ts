import { SpriteSheet } from "@common";
import { ParallaxLayer } from "@game/ParallaxBackground/parallaxLayer";
import { Vector } from "@math";
import { Images, RenderSpace, zIndex } from "@render";

class ForestBaseLayer implements ParallaxLayer {
    private static sheet = new SpriteSheet(Images.forest);
    private static size = new Vector(Images.forest.frameWidth, Images.forest.frameHeight);

    static {
        this.sheet.setRenderSpace(RenderSpace.Screen);
    }

    public update(_deltaTime: number): void {

    }

    public getWidth(): number {
        return ForestBaseLayer.size.x;
    }

    public getHeight(): number {
        return ForestBaseLayer.size.y;
    }

    public getZoomFactor(): number {
        return 1.1;
    }

    public tiles(): boolean {
        return true;
    }

    public getParallaxFactor(): number {
        return 0.2;
    }

    public draw(pos: Vector, size: Vector): void {
        ForestBaseLayer.sheet.draw(pos, size, false, 0, zIndex.Background);
    }
}

export { ForestBaseLayer };