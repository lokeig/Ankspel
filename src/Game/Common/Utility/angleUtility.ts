import { Vector } from "../Types/vector";

class AngleUtility {

    public rotateForce(force: Vector, angle: number): Vector {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        return new Vector(force.x * cos - force.y * sin, force.x * sin + force.y * cos);
    }

    public normalizeAngle(angle: number) {
        return ((angle + Math.PI) % (Math.PI * 2)) - Math.PI
    }
}

export { AngleUtility };