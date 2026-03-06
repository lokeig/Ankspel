import { SpriteSheet } from "@common";
import { BackgroundConfig } from "@game/Map/backgroundConfig";
import { Vector } from "@math";
import { Render, RenderSpace } from "@render";

class Parallax {
    private sheets: SpriteSheet[];
    private static imageWidth = 320;
    private static imageHeight = 240;
    private drawPos: Vector = new Vector();
    private static ZoomInFactor: number = 1.3;

    constructor(config: BackgroundConfig) {
        this.sheets = new Array(config.layers.length);
        for (let i = 0; i < config.layers.length; i++) {
            const layer = config.layers[i];
            this.sheets[i] = new SpriteSheet(layer.src);
            this.sheets[i].setRenderSpace(RenderSpace.Screen); 3
        }
    }

    public update(_deltaTime: number): void {

    }

    public draw(): void {
        const scaleX =  Render.get().getWidth() / Parallax.imageWidth;
        const scaleY =  Render.get().getHeight() / Parallax.imageHeight;

        const maxScale = Math.max(scaleX, scaleY);
        const currentScale = Render.get().getCameraZoom() * Parallax.ZoomInFactor;
        const scale = Math.max(currentScale, maxScale);

        const drawDimensions = new Vector(Parallax.imageWidth, Parallax.imageHeight).multiply(scale);
        

        this.drawPos.set(
            (Render.get().getWidth() - Parallax.imageWidth * scale) / 2,
            (Render.get().getHeight() - Parallax.imageHeight *scale) / 2
        );

        this.sheets.forEach(sheet => {
            sheet.draw(this.drawPos, drawDimensions, false, 0);
        })
    }

}

export { Parallax };