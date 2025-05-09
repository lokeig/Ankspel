import { GameObject } from "./gameobject";
import { Input } from "./input";
import { Blip, Tile, tileType } from "./tile";
import { Controls, Vector } from "./types";
import { Grid } from "./tile";

export enum State {
    None,
    Idle,
    Move,
    Jump,
    Flap,
    Crouch,
    Slide
}

export class PlayerStateMachine extends GameObject {

    public controls: Controls;

    private currentState: State = State.Idle;
    private states: Map<State, PlayerState> = new Map();

    public velocity: Vector = { x: 0, y: 0 };
    public grounded: Boolean = false;

    private walkOfBlockCD = 0;

    public readonly idleHeight: number;    

    public direction: "left" | "right";

    public movespeed: number = 70;
    public friction: number = 0.85;

    constructor(pos: Vector, controls: Controls) {
        const idleWidth = 35;
        const idleHeight = 68;
        super(pos, idleWidth, idleHeight)
        this.idleHeight = 68;

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
        if (this.currentState !== State.None) {
            this.states.get(this.currentState)!.stateExited();
        }
        this.currentState = newState;
        this.states.get(this.currentState)!.stateEntered();
    }

    public ignoreGravity: boolean = false;
    public jumpJustPressed: boolean = false;
    public update(deltaTime: number): void {

        if (Input.isKeyJustPressed(this.controls.jump)) this.jumpJustPressed = true;
        else (this.jumpJustPressed = false);

        const tiles = Grid.getNearbyTiles(this);

        const state = this.states.get(this.currentState)!;
        state.stateUpdate(deltaTime);
        
        const nextState = state.stateChange();
        if (nextState !== State.None) {
            this.changeState(nextState);
        }

        const gravity = 30;
        const maxNegVel = 15;
        if (!this.ignoreGravity) {
            this.velocity.y += gravity * deltaTime;
            if (this.velocity.y > maxNegVel) this.velocity.y = maxNegVel
        }
        this.velocity.x *= this.friction;

        this.pos.x += this.velocity.x;
        this.horizontalCollision(tiles);

        this.pos.y += this.velocity.y;
        this.verticalCollision(tiles);

        this.grounded = this.walkOfBlockCD < 0.08;
        this.walkOfBlockCD += deltaTime;
    }

    private lastDirection: "left" | "right" = "left";
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

    public isJumping: boolean = false;
    private minJump: number = 8;
    private jumpForce: number = 40;
    private jumpTime: number = 0;
    private jumpMaxTime: number = 0.15;
    public handleJump(deltaTime: number): void {

        if (this.jumpJustPressed && this.grounded && !this.isJumping) {
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

    public standingOnBlock: tileType | undefined = undefined;
    public onPlatform: boolean = false;
    public ignorePlatforms: boolean = false;

    verticalCollision(tiles: Array<Tile | Blip>) {
        const corners = this.getCorners();
        this.onPlatform = false;
        for (const tile of tiles.values()) {
            if (this.collision(tile)) {
                if (tile.platform) { 
                    this.onPlatform = true;
                    if (this.ignorePlatforms) continue;
                    if ((this.pos.y + this.height - this.velocity.y - 1) > tile.pos.y) continue; 
                }
                if(this.velocity.y > 0) {
                    this.pos.y = Grid.snap(corners.BL).y - this.height;
                    this.walkOfBlockCD = 0;
                    this.standingOnBlock = tile.type;
                } else {
                    this.pos.y = Grid.snap(corners.TL).y + Grid.tileSize;
                }
                this.velocity.y = 0;
                this.isJumping = false;
                break;
            }
        }
    }
    
    horizontalCollision(tiles: Array<Tile | Blip>) {
        const corners = this.getCorners();
        for (const tile of tiles.values()) {
            if (this.collision(tile) && !tile.platform) {
                if (this.velocity.x < 0) {
                    this.pos.x = Grid.snap(corners.BL).x + Grid.tileSize;
                } else {
                    this.pos.x = Grid.snap(corners.BR).x - this.width;
                }
                this.velocity.x = 0;
                break;
                
            }
        }
    }
}

export abstract class PlayerState {
    stateMachine: PlayerStateMachine;

    constructor(stateMachine: PlayerStateMachine) {
        this.stateMachine = stateMachine;
    }
  
    public stateUpdate(deltaTime: number): void { }
    public stateChange(): State { return State.None; }
    public stateEntered(): void { }
    public stateExited(): void { }
}

export class PlayerStateIdle extends PlayerState {
    public stateUpdate(deltaTime: number): void {
        this.stateMachine.move(deltaTime);
        this.stateMachine.handleJump(deltaTime);
    }

    public stateChange(): State {
        if (Input.isKeyPressed(this.stateMachine.controls.down)) return State.Crouch

        if (!this.stateMachine.grounded) return State.Jump

        const left = Input.isKeyPressed(this.stateMachine.controls.left);
        const right = Input.isKeyPressed(this.stateMachine.controls.right);

        if ((right || left) && !(left && right)) { 
            return State.Move
        }

        return State.None;
    }
}

export class PlayerStateMove extends PlayerState {
    constructor(stateMachine: PlayerStateMachine) {
        super(stateMachine);
    }
    stateUpdate(deltaTime: number): void {
        this.stateMachine.move(deltaTime);
        this.stateMachine.handleJump(deltaTime);
    }
    stateChange(): State {
        if (Input.isKeyPressed(this.stateMachine.controls.down)) return State.Slide

        if (!this.stateMachine.grounded) return State.Jump

        const left = Input.isKeyPressed(this.stateMachine.controls.left);
        const right = Input.isKeyPressed(this.stateMachine.controls.right);

        if ((right || left) && !(left && right)) { 
            return State.None
        }

        return State.Idle;
    }

    public stateEntered(): void {
    }
}

export class PlayerStateJump extends PlayerState {
    public stateUpdate(deltaTime: number): void {
        this.stateMachine.move(deltaTime);
        this.stateMachine.handleJump(deltaTime);
    }

    public stateChange(): State {
        if (Input.isKeyPressed(this.stateMachine.controls.down)) return State.Crouch;

        if (this.stateMachine.jumpJustPressed) return State.Flap;

        if (this.stateMachine.grounded) return State.Idle;
        
        return State.None;
    }
}

export class PlayerStateCrouch extends PlayerState {

    private ignorePlatforms: number = 0;
    public stateEntered(): void {
        this.ignorePlatforms = Infinity;
        this.stateMachine.height = 20;
        this.stateMachine.pos.y += this.stateMachine.idleHeight - this.stateMachine.height;
    }

    public stateUpdate(deltaTime: number): void {
        this.ignorePlatforms += deltaTime;
        if (!this.stateMachine.onPlatform) this.stateMachine.handleJump(deltaTime);
        if (this.stateMachine.jumpJustPressed) { 
            this.ignorePlatforms = 0;
        }
        this.stateMachine.ignorePlatforms = this.ignorePlatforms < 0.15
   
    }

    public stateChange(): State {
        if (Input.isKeyPressed(this.stateMachine.controls.down)) { return State.None }
        if (this.stateMachine.grounded) return State.Idle
        return State.Jump;
    }
    public stateExited(): void {
        this.stateMachine.pos.y -= this.stateMachine.idleHeight - this.stateMachine.height;
        this.stateMachine.height = this.stateMachine.idleHeight;
        this.stateMachine.ignorePlatforms = false;
    }
}

export class PlayerStateSlide extends PlayerState {

    private ignorePlatforms: number = 0;
    private prevFriction = this.stateMachine.friction;
    
    public stateEntered(): void {
        this.stateMachine.friction = 0.95;
        this.ignorePlatforms = Infinity;
        this.stateMachine.height = 20;
        this.stateMachine.pos.y += this.stateMachine.idleHeight - this.stateMachine.height;
    }

    public stateUpdate(deltaTime: number): void {
        this.ignorePlatforms += deltaTime;
        if (!this.stateMachine.onPlatform) this.stateMachine.handleJump(deltaTime);
        if (this.stateMachine.jumpJustPressed) { 
            this.ignorePlatforms = 0;
        }
        this.stateMachine.ignorePlatforms = this.ignorePlatforms < 0.15
   
    }

    public stateChange(): State {
        if (Input.isKeyPressed(this.stateMachine.controls.down)) { return State.None }
        if (this.stateMachine.grounded) return State.Idle
        return State.Jump;
    }
    public stateExited(): void {
        this.stateMachine.friction = this.prevFriction
        this.stateMachine.pos.y -= this.stateMachine.idleHeight - this.stateMachine.height;
        this.stateMachine.height = this.stateMachine.idleHeight;
        this.stateMachine.ignorePlatforms = false;
    }
}

export class PlayerStateFlap extends PlayerState{
    private flapSpeed: number = 2;
    public stateUpdate(deltaTime: number): void {
        this.stateMachine.move(deltaTime);
        if (this.stateMachine.velocity.y > this.flapSpeed) {
            this.stateMachine.ignoreGravity = true;
            this.stateMachine.velocity.y = this.flapSpeed;
        }
    }
    public stateChange(): State {
        if (Input.isKeyPressed(this.stateMachine.controls.down)) return State.Crouch

        if (this.stateMachine.grounded) return State.Idle;
        if (Input.isKeyPressed(this.stateMachine.controls.jump)) { return State.None }
        return State.Jump;
    }

    public stateExited(): void {
        this.stateMachine.ignoreGravity = false;
    }
}