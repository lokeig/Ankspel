import { Vector } from "../Types/vector";

export class VectorUtility {

    public getPointsAroundCircle(center: Vector, radius: number, amountOfPoints: number): Vector[] {
        const result = [];
        for (let i = 0; i < amountOfPoints; i++) {
            const angle = i * 2 * Math.PI / amountOfPoints
            const currentPoint = {
                x: center.x + Math.cos(angle) * radius,
                y: center.y + Math.sin(angle) * radius 
            };
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
