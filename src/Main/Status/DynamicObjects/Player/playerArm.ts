import { images } from "../../../images";
import { SpriteAnimator, SpriteSheet, Animation } from "../../Common/sprite";
import { Vector } from "../../Common/types";


export class PlayerArm {

    private animator: SpriteAnimator;
    public drawSize: number = 32;
    public pos: Vector = { x: 0, y: 0 };
    public angle: number = 0;
    public posOffset: Vector = { x: 0, y: 0 };
    public hidden: boolean = false;
    public rotateSpeed: number = 25;

    public itemAnimation: Animation = {
        frames: [{row: 8, col: 0}], fps: 8, repeat: false
    }

    constructor(animation: Animation) {
        this.animator = new SpriteAnimator(new SpriteSheet(images.playerHands, 16, 16), animation);
    }
    
    public update(deltaTime: number) {
        this.animator.update(deltaTime);
    }
    
    public draw(flip: boolean) {
        if (this.hidden) {
            return;
        }        
        const drawPosX = this.pos.x; 
        const drawPosY = this.pos.y; 
        const pos = { x: drawPosX, y: drawPosY };
        this.animator.draw(pos, this.drawSize, flip, this.angle);
    }

    public getCenter(): Vector {
        return {
            x: this.pos.x + (this.drawSize / 2),
            y: this.pos.y + (this.drawSize / 2)
        };
    }

    public setAnimation(animation: Animation) {
        this.animator.setAnimation(animation);
    }
}