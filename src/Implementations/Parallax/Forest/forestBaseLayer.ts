import { SpriteSheet } from "@common";
import { ParallaxLayer } from "@game/ParallaxBackground/parallaxLayer";
import { Vector } from "@math";
import { Images, Render, RenderSpace } from "@render";

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
        return 4;
    }

    public getParallaxFactor(): number {
        return 1;
    }

    public draw(pos: Vector, zoom: number): void {
        // const render = Render.get();
        // const screenWidth = render.getWidth();
        // const screenHeight = render.getHeight();

        // const scaledSize = ForestBaseLayer.size.clone().multiply(zoom);

        // const maxOffsetX = Math.max(0, scaledSize.x - screenWidth);
        // const maxOffsetY = Math.max(0, scaledSize.y - screenHeight);

        // const clampedPos = new Vector(
        //     Math.min(0, Math.max(pos.x, -maxOffsetX)),
        //     Math.min(0, Math.max(pos.y, -maxOffsetY))
        // );

        ForestBaseLayer.sheet.draw(pos, ForestBaseLayer.size.clone().multiply(zoom), false, 0);
    }
}

export { ForestBaseLayer };