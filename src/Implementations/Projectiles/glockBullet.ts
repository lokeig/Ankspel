import { Vector } from "@common";
import { Bullet } from "./bullet";

class GlockBullet extends Bullet {
    constructor(pos: Vector, angle: number) {
        const speed = 2500;
        const distance = 16;
        super(pos, angle, speed, distance);
    }
}

export { GlockBullet };