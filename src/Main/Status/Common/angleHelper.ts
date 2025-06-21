import { Vector } from "./types";

export function rotateForce(force: Vector, angle: number): Vector {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    return {
        x: force.x * cos - force.y * sin,
        y: force.x * sin + force.y * cos
    };
}

export function normalizeAngle(angle: number) {
    return ((angle + Math.PI) % (Math.PI * 2)) - Math.PI
}
