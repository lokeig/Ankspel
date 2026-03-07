function lerpEase(a: number, b: number, t: number) {
    t = t * t * (3 - 2 * t);
    return a + (b - a) * t;
}

export { lerpEase };
