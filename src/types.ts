export type Vector = {
    x: number,
    y: number
}

export function vectorMul(vec: Vector, amount: number) {
    return {x: vec.x * amount, y: vec.y * amount}
}

export type Direction = "LEFT" | "RIGHT";
export const left = "LEFT";
export const right = "RIGHT";