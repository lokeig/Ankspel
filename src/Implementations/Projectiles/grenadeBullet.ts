import { Vector } from "@common";
import { Bullet } from "./bullet";

class GrenadeBullet extends Bullet{
    constructor(pos: Vector, angle: number) {
        const speed = 22;
        const lifespan = 15;
        super(pos, angle, speed, lifespan);
    }
}

export { GrenadeBullet };