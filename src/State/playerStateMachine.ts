import { GameObject } from "../gameobject";
import { Controls, Vector } from "../types";
import { Grid } from "../grid";
import { Input } from "../input";

import { PlayerState, State } from "./playerState";
import { PlayerStateIdle } from "./idle";
import { PlayerStateMove } from "./move";
import { PlayerStateJump } from "./jump";
import { PlayerStateCrouch } from "./crouch";
import { PlayerStateSlide } from "./slide";
import { PlayerStateFlap } from "./flap";
import { Cooldown } from "./cooldown";

export class PlayerStateMachine extends GameObject {

    public controls: Controls;

    private currentState: State = State.Idle;
    private states: Map<State, PlayerState> = new Map();

    public velocity: Vector = { x: 0, y: 0 };
    public grounded: Boolean = false;

    private timeOffBlock = new Cooldown(0.08);

    public readonly idleHeight: number;    

    public direction: "left" | "right";

    public movespeed: number = 50;
    public friction: number = 10;

    constructor(pos: Vector, controls: Controls) {
        const idleWidth = 18;
        const idleHeight = 46;
        super(pos, idleWidth, idleHeight)
        this.idleHeight = idleHeight;

        this.states.set(State.Idle, new PlayerStateIdle(this));
        this.states.set(State.Move, new PlayerStateMove(this));
        this.states.set(State.Jump, new PlayerStateJump(this));
        this.states.set(State.Crouch, new PlayerStateCrouch(this));
        this.states.set(State.Slide, new PlayerStateSlide(this));
        this.states.set(State.Flap, new PlayerStateFlap(this));

        this.controls = controls;

        this.direction = "left";
    }

    public getState(): State {
        return this.currentState;
    }

    public changeState(newState: State): void {
        this.states.get(this.currentState)!.stateExited();
        
        this.currentState = newState;
        this.states.get(this.currentState)!.stateEntered();
        
    }

    public ignoreGravity: boolean = false;
    public jumpJustPressed: boolean = false;

    public update(deltaTime: number): void {
        this.jumpJustPressed = Input.isKeyJustPressed(this.controls.jump);

        const state = this.states.get(this.currentState)!;
        state.stateUpdate(deltaTime);
        
        const nextState = state.stateChange();
        if (nextState !== State.None) {
            this.changeState(nextState);
        }

        this.handleMovement(deltaTime);
    }

    public jumpEnabled: boolean = true;
    public isJumping: boolean = false;
    private minJump: number = 6;
    private jumpForce: number = 30;
    private jumpTime: number = 0;
    private jumpMaxTime: number = 0.2;
    public handleJump(deltaTime: number): void {

        if (this.jumpEnabled && this.jumpJustPressed && !this.timeOffBlock.isReady() && !this.isJumping) {
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

    public onPlatform: boolean = false;
    public ignorePlatforms: boolean = false;

    public nearbyTiles = Grid.getNearbyTiles(this);
    public tileCollision(): boolean {
        this.onPlatform = false;
        for (const tile of this.nearbyTiles.values()) {
            if (this.collision(tile)) {
                if (tile.platform) { 
                    this.onPlatform = true;
                    const belowPlatform = this.pos.y + this.height - this.velocity.y - 1 > tile.pos.y;
                    if (this.ignorePlatforms || belowPlatform) continue; 
                }
            return true;
            }
        }
        return false;
    }


    handleVerticalCollision() {
        this.onPlatform = false;
        this.grounded = false;

        if (this.tileCollision()) {

            if (this.velocity.y > 0) {
                this.pos = Grid.snap(this, "bot");
                this.grounded = true;
                this.timeOffBlock.reset();
            }
            else {
                this.pos = Grid.snap(this, "top");
            }

            this.velocity.y = 0;
            this.isJumping = false;
        } 
    }
    
    handleHorizontalCollision() {
        if (this.tileCollision()) {
            if (this.velocity.x > 0) {
                this.pos = Grid.snap(this, "right")
            }
            else {
                this.pos = Grid.snap(this, "left");
            }
            this.velocity.x = 0;
        }
    }

    private lastDirection: "left" | "right" = "left";
    public allowMove: boolean = true;
    public move(deltaTime: number): void {
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

    handleMovement(deltaTime: number) {
        this.nearbyTiles = Grid.getNearbyTiles(this);

        if (this.allowMove) this.move(deltaTime);
        this.handleJump(deltaTime);

        this.velocity.x -= this.velocity.x * this.friction * deltaTime;

        const gravity = 27;
        const maxNegVel = 15;

        if (!this.ignoreGravity) {
            this.velocity.y += gravity * deltaTime;
            if (this.velocity.y > maxNegVel) this.velocity.y = maxNegVel
        }

        this.pos.x += this.velocity.x;
        this.handleHorizontalCollision();

        this.pos.y += this.velocity.y;
        this.handleVerticalCollision();

        this.timeOffBlock.update(deltaTime);

    }

    blockAboveIdle(): boolean {
        const prevHeight = this.height;
        const prevY = this.pos.y;

        this.height = this.idleHeight;
        this.pos.y -= this.idleHeight - prevHeight;

        (this.pos.y + this.height) - this.idleHeight;
        
        const topLeftCell  = Grid.getCell(Grid.getGridPos({ x: this.pos.x, y: this.pos.y }));
        const topRightCell = Grid.getCell(Grid.getGridPos({ x: this.pos.x + this.width, y: this.pos.y }));

        if (topLeftCell) {
            if (this.collision(topLeftCell)) {
                this.pos.y = prevY;
                this.height = prevHeight;
                return true;
            }
        }

        if (topRightCell) {
            if (this.collision(topRightCell)) {
                this.pos.y = prevY;
                this.height = prevHeight;
                return true;
            }
        }

        this.pos.y = prevY;
        this.height = prevHeight;

        return false
    }
}


