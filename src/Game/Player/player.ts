import { Controls, IState, StateMachine, Vector } from "@common";
import { PlayerCharacter } from "./Character/playerCharacter";
import { PlayerState, PlayerStandard, PlayerFlap, PlayerSlide, PlayerRagdoll } from "./PlayerStates";
import { Render } from "@render";
import { IItem, Ownership } from "@item";

class Player {
    public character!: PlayerCharacter;
    private stateMachine: StateMachine<PlayerState>;

    constructor(id: number) {
        this.stateMachine = new StateMachine<PlayerState>(PlayerState.Standard);
        this.character = new PlayerCharacter(new Vector(), id);
        this.setupStateMachine();
    }

    public setControls(controls: Controls) {
        this.character.setControls(controls);
    }

    public held(): boolean {
        return (this.getStateInstance(PlayerState.Ragdoll) as PlayerRagdoll).getOwnership() === Ownership.Held;

    }

    private setupStateMachine(): void {
        this.stateMachine.addState(PlayerState.Standard, new PlayerStandard(this.character));
        this.stateMachine.addState(PlayerState.Flap, new PlayerFlap(this.character));
        const crouch = true;
        this.stateMachine.addState(PlayerState.Crouch, new PlayerSlide(this.character, crouch));
        this.stateMachine.addState(PlayerState.Slide, new PlayerSlide(this.character, !crouch));
        this.stateMachine.addState(PlayerState.Ragdoll, new PlayerRagdoll(this.character));
        this.stateMachine.enterState();
    }

    public setRagdoll(head: Vector, body: Vector, legs: Vector, velocity: Vector) {
        const ragdoll: PlayerRagdoll = this.stateMachine.getInstance(PlayerState.Ragdoll) as PlayerRagdoll;
        ragdoll.setBody(head, body, legs, velocity);
    }

    public getRagdollInfo(): { head: Vector, body: Vector, legs: Vector, velocity: Vector } {
        const ragdoll: PlayerRagdoll = this.stateMachine.getInstance(PlayerState.Ragdoll) as PlayerRagdoll;
        return ragdoll.getBodies();
    }

    public getStateInstance(state: PlayerState): IState<PlayerState> {
        return this.stateMachine.getInstance(state);
    }

    public setNearbyItems(items: IItem[]): void {
        this.character.itemManager.setNearbyItems(items);
    }

    public setState(state: PlayerState): void {
        if (state !== this.stateMachine.getCurrentState()) {
            this.stateMachine.forceState(state);
        }
    }

    public getCurrentState(): PlayerState {
        return this.stateMachine.getCurrentState();
    }

    public update(deltaTime: number): void {
        if (this.character.isDead() && this.stateMachine.getCurrentState() !== PlayerState.Ragdoll) {
            this.stateMachine.forceState(PlayerState.Ragdoll);
        }
        const noStateChange = this.character.isLocal() ? false : true;
        this.stateMachine.update(deltaTime, noStateChange);
    };

    public draw(): void {
        this.character.body.getNearbyTiles().forEach(tile => {
            Render.get().drawSquare({
                x: tile.pos.x,
                y: tile.pos.y,
                width: tile.width,
                height: tile.height
            }, 0, "green");
        });
        this.stateMachine.draw();
    }
}

export { Player };