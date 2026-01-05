import { Vector } from "../Types/vector";

class VectorUtility {

    public getPointsAroundCircle(center: Vector, radius: number, amountOfPoints: number): Vector[] {
        const result = [];
        for (let i = 0; i < amountOfPoints; i++) {
            const angle = i * 2 * Math.PI / amountOfPoints
            const currentPoint = new Vector(
                center.x + Math.cos(angle) * radius,
                center.y + Math.sin(angle) * radius
            )
            result.push(currentPoint);
        }
        return result;
    }
    
    public randomOffsetVectorArray(array: Array<Vector>, maxOffset: number): void {
        for (const value of array.values()) {
            value.x += (Math.random() * maxOffset) * (Math.random() < 0.5 ? -1 : 1);
            value.y += (Math.random() * maxOffset) * (Math.random() < 0.5 ? -1 : 1);
        }
    }
}

export { VectorUtility };