import { Vector } from "@common";
import { Bullet } from "./bullet";

class GrenadeBullet extends Bullet{
    constructor(pos: Vector, angle: number) {
        const speed = 2200;
        const lifespan = 0.06;
        super(pos, angle, speed, lifespan);
    }
}

export { GrenadeBullet };