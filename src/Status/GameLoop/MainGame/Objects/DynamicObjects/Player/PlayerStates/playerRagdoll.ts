import { Input } from "../../../../Common/input";
import { StateInterface } from "../../../../Common/StateMachine/stateInterface";
import { PlayerState } from "./playerState";
import { PlayerBody } from "../Body/playerBody";
import { DynamicObject } from "../../Common/dynamicObject";
import { Vector } from "../../../../Common/Types/vector";
import { SpriteSheet } from "../../../../Common/Sprite/sprite";
import { images } from "../../../../Common/images";
import { Render } from "../../../../../../../HMI/render";
import { Utility } from "../../../../Common/Utility/utility";

export class PlayerRagdoll implements StateInterface<PlayerState> {

    private playerBody: PlayerBody;
    private head: DynamicObject;
    private body: DynamicObject;
    private legs: DynamicObject;

    private headAngle = 0;
    private legsAngle = 0;

    private readonly headHeight = 16;
    private readonly legsHeight = 24;
    private readonly width: number;

    private readonly distanceBetweenBodies = 22;
    private moveSpeed = 100;

    private spriteSheet = new SpriteSheet(images.playerImage, 32, 32);

    constructor(playerBody: PlayerBody) {
        this.playerBody = playerBody;
        this.width = playerBody.standardWidth;
        this.head = new DynamicObject({ x: 0, y: 0 }, this.width, this.headHeight);
        this.legs = new DynamicObject({ x: 0, y: 0 }, this.width, this.legsHeight);
        this.body = new DynamicObject({ x: 0, y: 0 }, 3, 3);
        this.head.bounceFactor = 0.7;
        this.head.friction = 8;
        this.legs.friction = 8;
    }


    public stateEntered(): void {
        this.head.direction = this.playerBody.dynamicObject.direction;
        this.legs.direction = this.playerBody.dynamicObject.direction;

        const pos = this.playerBody.dynamicObject.pos;
        this.head.pos = { x: pos.x, y: pos.y }
        this.legs.pos = { x: pos.x, y: pos.y - this.legs.height + this.playerBody.dynamicObject.height};    

        const vel = this.playerBody.dynamicObject.velocity;
        this.head.velocity = { x: vel.x + 0.1 * this.head.getDirectionMultiplier(), y: vel.y };
        this.legs.velocity = { x: vel.x, y: vel.y };
        
        this.headAngle = 0;
        this.legsAngle = 0;
    }

    public stateUpdate(deltaTime: number): void {
        this.head.ignoreFriction = !this.head.grounded;
        this.legs.ignoreFriction = !this.legs.grounded;

        this.head.update(deltaTime);
        this.legs.update(deltaTime);

        
        this.keepBodiesTogether();
        
        this.handleInputs(deltaTime);    

        this.setHeadAngle();
        this.setLegsAngle();
    }

    private keepBodiesTogether(): void {
        for (let i = 0; i < 15; i++) {       
            const headCenter = this.head.getCenter();
            const legsCenter = this.legs.getCenter();

            const DX = legsCenter.x - headCenter.x;
            const DY = legsCenter.y - headCenter.y;
            
            const distance = Math.hypot(DX, DY);
            const diff = (distance - this.distanceBetweenBodies) / distance;

            const impulseX = DX * diff * 0.5;
            const impulseY = DY * diff * 0.5;

            const prevHeadVel = { x: this.head.velocity.x, y: this.head.velocity.y };
            const prevLegsVel = { x: this.legs.velocity.x, y: this.legs.velocity.y };
            
            this.head.velocity.x = impulseX;
            this.head.velocity.y = impulseY;
            this.legs.velocity.x = -impulseX;
            this.legs.velocity.y = -impulseY + 0.001;

            this.head.updatePositions();
            this.legs.updatePositions();

            this.head.velocity = {
                x: prevHeadVel.x + impulseX,
                y: prevHeadVel.y + impulseY
            };

            this.legs.velocity = {
                x: prevLegsVel.x - impulseX,
                y: prevLegsVel.y - impulseY
            };
        }
    }

    private setHeadAngle(): void {
        const headCenter = this.head.getCenter();
        const headTarget = this.legs.getCenter();
        
        this.headAngle = (Math.atan2(headTarget.y - headCenter.y, headTarget.x - headCenter.x) - Math.PI / 2) * this.head.getDirectionMultiplier();
    }
    private setLegsAngle(): void {
        const legsCenter = this.legs.getCenter();
        const legsTarget = this.head.getCenter();
        
        this.legsAngle = (Math.atan2(legsTarget.y - legsCenter.y, legsTarget.x - legsCenter.x) + Math.PI / 2) * this.legs.getDirectionMultiplier();
    }

    private handleInputs(deltaTime: number): void {
        if (Input.keyPress(this.playerBody.controls.left)) {
            this.head.velocity.x -= this.moveSpeed / 2 * deltaTime;
            this.legs.velocity.x -= this.moveSpeed / 2 * deltaTime;
            this.head.velocity.y -= this.moveSpeed * 1.5 * deltaTime;     
            this.legs.velocity.y -= this.moveSpeed *  deltaTime;       
  
        }

        if (Input.keyPress(this.playerBody.controls.right)) {
            this.head.velocity.x += this.moveSpeed / 2 * deltaTime;
            this.legs.velocity.x += this.moveSpeed / 2 * deltaTime;
            this.head.velocity.y -= this.moveSpeed * 1.5 * deltaTime;     
            this.legs.velocity.y -= this.moveSpeed *  deltaTime;       
  
        }

        if (Input.keyPress(this.playerBody.controls.up)) {
            this.head.velocity.y -= -this.moveSpeed * 2 * deltaTime;
            this.head.velocity.y -= -this.moveSpeed * 2 * deltaTime;
        }
    }

    public stateChange(): PlayerState {
        const isGrounded = this.head.grounded || this.legs.grounded;
        const exitKeyPressed = Input.keyPress(this.playerBody.controls.ragdoll) || Input.keyPress(this.playerBody.controls.jump);
        if (exitKeyPressed && isGrounded) {
            return PlayerState.Standing;
        }
        return PlayerState.Ragdoll;
    }

    public stateExited(): void {
       const jumpHeight = 25;
       this.playerBody.dynamicObject.pos = { x: this.legs.pos.x, y: this.legs.pos.y - this.legs.height - jumpHeight};
       this.playerBody.dynamicObject.velocity = { x: this.head.velocity.x, y: -5};
       this.playerBody.dynamicObject.grounded = true;
       this.playerBody.setArmPosition();
    }

    private getHeadDrawPos(): Vector {
        const x = this.head.pos.x + ((this.head.width -  this.playerBody.drawSize) / 2);
        const y = this.head.pos.y + (this.playerBody.dynamicObject.height - this.playerBody.drawSize);
        return { x, y };
    }

    private getLegsDrawPos(): Vector {
        const x = this.legs.pos.x + ((this.legs.width -  this.playerBody.drawSize) / 2);
        const y = this.legs.pos.y + (this.playerBody.dynamicObject.height - this.playerBody.drawSize);
        return { x, y };
    }

    public stateDraw(): void {
        const flip = this.head.direction === "left";
        this.spriteSheet.draw(8, 0, this.getHeadDrawPos(), this.playerBody.drawSize, flip, this.headAngle);
        this.spriteSheet.draw(9, 0, this.getLegsDrawPos(), this.playerBody.drawSize, flip, this.legsAngle);
    }
}
