
export function lerpAngle(a: number, b: number, t: number) {
    const difference = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
    return a + difference * t;
}
