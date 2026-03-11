import { Vector } from "@math";

interface ParallaxLayer {
    update(deltaTime: number): void;

    getWidth(): number;
    getHeight(): number;
    getZoomFactor(): number;
    getParallaxFactor(): number;

    draw(pos: Vector, zoom: number): void;
}

export type { ParallaxLayer };