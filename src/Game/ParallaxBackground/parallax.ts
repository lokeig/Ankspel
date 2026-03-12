import { Vector } from "@math";
import { Render } from "@render";
import { ParallaxLayer } from "./parallaxLayer";
import { MaxMinPositions } from "@common";

class Parallax {
    private static register: Map<string, Parallax> = new Map();

    private layers: ParallaxLayer[];

    private static baseSize = new Vector(320, 240);

    constructor(...layers: ParallaxLayer[]) {
        this.layers = layers;
    }

    public update(deltaTime: number): void {
        this.layers.forEach(layer => layer.update(deltaTime));
    }

    public draw(positions: MaxMinPositions, pos: Vector): void {

        const center = new Vector((positions.minX + positions.maxX) / 2, (positions.minY + positions.maxY) / 2);
        const offset = pos.subtract(center).multiply(0.5);

        this.layers.forEach(layer => {

            const render = Render.get();

            const maxScale = Math.max(
                render.getWidth() / Parallax.baseSize.x,
                render.getHeight() / Parallax.baseSize.y
            );
            const currentScale = Render.get().getCameraZoom() * 1.25;

            let scale = Math.max(currentScale, maxScale);
            scale *= layer.getZoomFactor();

            const drawPos = new Vector(
                (render.getWidth() - (layer.getWidth() * scale)) / 2,
                (render.getHeight() - (layer.getHeight() * scale)) / 2
            );
            drawPos.subtract(offset.clone().multiply(layer.getParallaxFactor()));

            const scaledWidth = layer.getWidth() * scale;
            const scaledHeight = layer.getHeight() * scale;

            layer.draw(drawPos, new Vector(scaledWidth, scaledHeight));
        });
    }

    public static registerBackground(name: string, background: Parallax): void {
        this.register.set(name, background);
    }

    public static getBackground(name: string): Parallax | undefined {
        return this.register.get(name);
    }
}

export { Parallax };