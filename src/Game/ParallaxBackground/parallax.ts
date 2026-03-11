import { Vector } from "@math";
import { Render } from "@render";
import { ParallaxLayer } from "./parallaxLayer";
import { MaxMinPositions } from "@common";

class Parallax {
    private static register: Map<string, Parallax> = new Map();

    private layers: ParallaxLayer[];

    constructor(...layers: ParallaxLayer[]) {
        this.layers = layers;
    }

    public update(deltaTime: number): void {
        this.layers.forEach(layer => layer.update(deltaTime));
    }

    public draw(positions: MaxMinPositions, pos: Vector): void {
        const render = Render.get();

        const width = render.getWidth();
        const height = render.getHeight();
        const zoom = render.getCameraZoom();

        const length = new Vector(positions.maxX - positions.minX, positions.maxY - positions.minY);

        const percentageX = (pos.x - positions.minX) / length.x;
        const percentageY = (pos.y - positions.minY) / length.y;

        for (const layer of this.layers) {

            const scaleX = width / layer.getWidth();
            const scaleY = height / layer.getHeight();
            const maxScale = Math.max(scaleX, scaleY);

            const scale = Math.max(zoom * layer.getZoomFactor(), maxScale);

            // const parallax = layer.getParallaxFactor();

            console.log(percentageX); 

            const offset = new Vector(
                positions.minX + (positions.maxX * percentageX),
                positions.minY + (positions.maxY * percentageY)
            );

            const layerWidth = layer.getWidth() * scale;
            const layerHeight = layer.getHeight() * scale;

            const drawPos = new Vector(
                (width - layerWidth) / 2,
                (height - layerHeight) / 2
            ).subtract(offset);

            layer.draw(drawPos, scale);
        }
    }

    public static registerBackground(name: string, background: Parallax): void {
        this.register.set(name, background);
    }

    public static getBackground(name: string): Parallax | undefined {
        return this.register.get(name);
    }
}

export { Parallax };