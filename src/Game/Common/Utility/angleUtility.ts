import { Vector } from "../../../Math/vector";

class AngleUtility {

    public rotateForce(force: Vector, angle: number): Vector {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        return new Vector(force.x * cos - force.y * sin, force.x * sin + force.y * cos);
    }

    public normalize(angle: number): number {
        return ((angle + Math.PI) % (Math.PI * 2)) - Math.PI
    }

    public getDegrees(angle: number): number {
        return 180 * angle / Math.PI;
    }
}

export { AngleUtility };