import { Vector } from "@common";
import { Bullet } from "./bullet";

class GrenadeBullet extends Bullet{
    constructor(pos: Vector, angle: number) {
        const speed = 2000;
        const lifespan = 0.08;
        super(pos, angle, speed, lifespan);
    }
}

export { GrenadeBullet };