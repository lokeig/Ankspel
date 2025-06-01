import { Input } from "../../../Common/input";
import { Controls, Vector } from "../../../Common/types";
import { StaticObject } from "../../../StaticObjects/staticObject";
import { DynamicObject } from "../../Common/dynamicObject";
import { Item, ThrowType } from "../../Items/item";
import { PlayerItemHolder } from "./playerItemHolder";
import { PlayerJump } from "./playerJump";
import { PlayerMove } from "./playerMove";


export class PlayerObject extends DynamicObject {

    public controls: Controls;

    private playerMove = new PlayerMove();
    private playerJump = new PlayerJump();
    public playerItemHolder = new PlayerItemHolder();

    public jumpEnabled: boolean = true;
    public moveEnabled: boolean = true;

    public readonly standardFriction: number = 10;
    public readonly slideFriction: number = 5;
    public readonly idleHeight: number = 46;
    public readonly standardWidth: number = 18;    

    constructor(pos: Vector, controls: Controls) {

        const idleWidth = 18;
        const idleHeight = 46;

        super(pos, idleWidth, idleHeight)

        this.idleHeight = idleHeight;

        this.friction = this.standardFriction;

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

        if (Input.keyPress(this.controls.pickup)) {
            if (this.playerItemHolder.isHoldingItem()) {
                this.playerItemHolder.throwItem(this.controls);
            } else {
                const itemToPick = this.getItemPickup();
                if (itemToPick) {
                    this.playerItemHolder.pickUp(itemToPick);
                }
            }
        }

        if (Input.keyDown(this.controls.shoot)) {
            if (this.playerItemHolder.isHoldingItem()) {
                console.log("O");
            }
        }

        this.physicsPositionUpdate(deltaTime);
        this.playerItemHolder.setHoldingPosition(this.getCenter(), this.direction);

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

    public getItemPickup(): Item | null {
        for (const item of this.nearbyItems.values()) {
            if (this.collision(item)) {
                return item;
            }
        }
        return null;
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