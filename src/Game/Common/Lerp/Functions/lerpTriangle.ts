function lerpTriangle(a: number, b: number, t: number): number {
    return t < 0.5
        ? a + (b - a) * (t * 2)
        : b + (a - b) * ((t - 0.5) * 2);
}

export { lerpTriangle };