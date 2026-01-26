import { Vector } from "@common";
import { Bullet } from "./bullet";

class GrenadeBullet extends Bullet{
    constructor(pos: Vector, angle: number) {
        const speed = 2000;
        const distance = 6;
        super(pos, angle, speed, distance);
    }
}

export { GrenadeBullet };