import { DynamicObject } from "../dynamicObject";
import { Item } from "../item";
import { StaticObject } from "../staticObject";
import { Controls, Vector } from "../types";
import { PlayerJump } from "./playerJump";
import { PlayerMove } from "./playerMove";

export class PlayerObject extends DynamicObject {

    public controls: Controls;
    public readonly idleHeight: number;    

    private playerMove = new PlayerMove();
    private playerJump = new PlayerJump();

    public jumpEnabled: boolean = true;
    public moveEnabled: boolean = true;

    public holding: Item | undefined;

    constructor(pos: Vector, controls: Controls) {
        const idleWidth = 18;
        const idleHeight = 46;
        super(pos, idleWidth, idleHeight)
        this.idleHeight = idleHeight;

        this.controls = controls;
        this.direction = "left"
    }


    public update(deltaTime: number): void {
        if (this.grounded) {
            this.playerJump.resetCoyote();
        }

        if (this.moveEnabled) {
            this.velocity.x = this.playerMove.getVelocity(deltaTime, this.velocity.x, this.controls);
            this.direction = this.playerMove.getDirection();
        }

        if (this.jumpEnabled) {
            this.velocity.y = this.playerJump.getVelocity(deltaTime, this.velocity.y, this.controls)
        }

        this.physicsPositionUpdate(deltaTime);
    }

    public handleVerticalCollision(tile: StaticObject) {
        if (this.velocity.y > 0) {
            this.grounded = true;
            this.pos.y = tile.pos.y - this.height;
        } else {
            this.pos.y = tile.pos.y + tile.height;
            this.playerJump.isJumping = false;
        }
        this.velocity.y = 0;
    }


    public idleCollision(): boolean {
        const prevHeight = this.height;
        const prevY = this.pos.y;

        this.height = this.idleHeight;
        this.pos.y -= this.idleHeight - prevHeight;
        
        const returnValue = this.tileCollision(true)

        this.pos.y = prevY;
        this.height = prevHeight;

        return returnValue;
    }

    public onPlatform(): boolean {
        if (!this.grounded) {
            return false;
        }

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

    public jumpReady(): boolean {
        return this.playerJump.jumpReady();
    }
}