import { Vector } from "@math";

interface ParallaxLayer {
    update(deltaTime: number): void;

    getWidth(): number;
    getHeight(): number;

    getZoomFactor(): number;
    getParallaxFactor(): number;

    tiles(): boolean;

    draw(pos: Vector, size: Vector): void;
}

export type { ParallaxLayer };