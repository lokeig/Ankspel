import { DynamicObject } from "../dynamicObject";
import { Input } from "../input";
import { Cooldown } from "../cooldown";
import { Controls, Vector } from "../types";

export class PlayerObject extends DynamicObject {
    public controls: Controls;
    public readonly idleHeight: number;    
    public jumpJustPressed: boolean = false;

    // Moving
    public movespeed: number = 40;
    public friction: number = 10;
    public direction: "left" | "right";
    private lastDirection: "left" | "right" = "left";
    public allowMove: boolean = true;

    // Jumping
    public jumpEnabled: boolean = true;
    public isJumping: boolean = false;
    private minJump: number = 6;
    private jumpForce: number = 27;
    private jumpTime: number = 0;
    private jumpMaxTime: number = 0.2;
    private coyoteTime = new Cooldown(0.08);
    public ignoreGravity: boolean = false;
    

    constructor(pos: Vector, controls: Controls) {
        const idleWidth = 18;
        const idleHeight = 46;
        super(pos, idleWidth, idleHeight)
        this.idleHeight = idleHeight;

        this.controls = controls;

        this.direction = "left";
    }

    public update(deltaTime: number): void {
        this.jumpJustPressed = Input.isKeyJustPressed(this.controls.jump);

        if (this.grounded) {
            this.coyoteTime.reset();
        }

        if (this.allowMove) {
            this.move(deltaTime);
        }

        this.handleJump(deltaTime);
        this.updatePosition(deltaTime);        
        this.coyoteTime.update(deltaTime);    
    }

    private handleJump(deltaTime: number): void {

        if (this.jumpEnabled && this.jumpJustPressed && !this.coyoteTime.isReady() && !this.isJumping) {
            console.log("JUMPUPDATE")
            this.isJumping = true;
            this.velocity.y = -this.minJump;
            this.jumpTime = 0;
        }

        if (!Input.isKeyPressed(this.controls.jump) || (this.jumpTime > this.jumpMaxTime)) {
            this.isJumping = false;
        }

        if (Input.isKeyPressed(this.controls.jump) && this.isJumping) {
            this.velocity.y -= this.jumpForce * deltaTime
            this.jumpTime += deltaTime;
        }
    }

    private move(deltaTime: number): void {
        const left =  Input.isKeyPressed(this.controls.left);
        const right = Input.isKeyPressed(this.controls.right);

        if (left && right) {
            this.direction = this.lastDirection === "left" ? "right" : "left";
        } else {
            if (left)  this.direction = "left";
            if (right) this.direction = "right";

            this.lastDirection = this.direction;
        }
        const directionMultiplier = Number(right) - Number(left);
        this.velocity.x += this.movespeed * directionMultiplier * deltaTime
    }

    idleCollision(): boolean {
        const prevHeight = this.height;
        const prevY = this.pos.y;

        this.height = this.idleHeight;
        this.pos.y -= this.idleHeight - prevHeight;
        
        const returnValue = this.tileCollision(false)

        this.pos.y = prevY;
        this.height = prevHeight;

        return returnValue;
    }

    onPlatform(): boolean {
        if (!this.grounded) return false;

        let allPlatforms = true;
        let noCollisions = true;

        const prevPosY = this.pos.y;
        this.pos.y += 5;

        for (const tile of this.nearbyTiles.values()) {
            if (this.collision(tile)) {
                noCollisions = false;
                if (!tile.platform) {
                    allPlatforms = false;
                }
            }
        }

        this.pos.y = prevPosY;

        return !noCollisions && allPlatforms
    }
}