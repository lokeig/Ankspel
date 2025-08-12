import { Direction, Vector } from "./types";


export function getReverseDirection(direction: Direction) {
    switch (direction) {
        case "left": return "right";
        case "right": return "left";
        case "top": return "bot";
        case "bot": return "top";
        case "topLeft": return "botRight";
        case "topRight": return "botLeft";
        case "botLeft": return "topRight";
        case "botRight": return "topLeft";
    }
}

export function getPointsAroundCircle(center: Vector, radius: number, amountOfPoints: number): Vector[] {
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

export function getRandomArray(n: number): number[] {

    const arr = Array.from({ length: n }, (_, i) => i + 1);

    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

  return arr;
}

export function randomOffsetVectorArray(array: Array<Vector>, maxOffset: number): void {
    for (const value of array.values()) {
        value.x += (Math.random() * maxOffset) * (Math.random() < 0.5 ? -1 : 1);
        value.y += (Math.random() * maxOffset) * (Math.random() < 0.5 ? -1 : 1);
    }
}

export function getRandomNumber(min: number, max: number) {
    return min + (max-min) * Math.random();
}