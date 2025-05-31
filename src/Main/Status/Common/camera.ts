import { Vector } from "./types";

class Camera {
    pos: Vector;
    width: number;
    height: number;

    constructor(pos: Vector, width: number, height: number) {
        this.pos = pos;
        this.width = width;
        this.height = height;
    }
}