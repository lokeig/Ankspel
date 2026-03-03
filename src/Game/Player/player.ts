import { Vector } from "@math";
import { Controls, Grid, IState, StateMachine, Utility } from "@common";
import { PlayerCharacter } from "./Character/playerCharacter";
import { PlayerState, PlayerStandard, PlayerFlap, PlayerSlide, PlayerRagdoll } from "./PlayerStates";
import { ItemManager, Ownership } from "@item";
import { Connection, GameMessage } from "@server";
import { ImageInfo, ImageName } from "@render";

class Player {
    public character!: PlayerCharacter;
    private stateMachine: StateMachine<PlayerState>;
    private id: number;

    constructor(id: number, color: ImageName, controls?: Controls) {
        this.stateMachine = new StateMachine<PlayerState>(PlayerState.Standard);
        this.id = id;
        this.character = new PlayerCharacter(new Vector(), id, color);
        if (controls) {
            this.character.setControls(controls);
        }
        this.setupStateMachine();
    }

    public setSpawn(gridPos: Vector): void {
        const worldPos = Grid.getWorldPos(gridPos);
        worldPos.y -= this.character.standardBody.height;
        worldPos.x += (Grid.size - this.character.standardBody.width) / 2;
        this.character.setPos(worldPos);
        Connection.get().sendGameMessage(GameMessage.PlayerSpawn, { id: this.id, pos: Utility.Vector.convertToNetwork(worldPos) });
    }

    public getId(): number {
        return this.id;
    }
    
    public held(): boolean {
        const ragdoll = this.stateMachine.getInstance(PlayerState.Ragdoll) as PlayerRagdoll;
        return ragdoll.getOwnership() === Ownership.Held;
    }

    public reset(): void {
        this.stateMachine.forceState(PlayerState.Standard);
        this.character.reset();
        this.stateMachine.enterState();
    }

    private setupStateMachine(): void {
        this.stateMachine.addState(PlayerState.Standard, new PlayerStandard(this.character));
        this.stateMachine.addState(PlayerState.Flap, new PlayerFlap(this.character));
        const crouch = true;
        this.stateMachine.addState(PlayerState.Crouch, new PlayerSlide(this.character, crouch));
        this.stateMachine.addState(PlayerState.Slide, new PlayerSlide(this.character, !crouch));

        const ragdoll = new PlayerRagdoll(this.character, this.id);

        ItemManager.addPermanent(ragdoll, this.id);
        
        this.stateMachine.addState(PlayerState.Ragdoll, ragdoll);
        this.stateMachine.enterState();
    }

    public getStateInstance(state: PlayerState): IState<PlayerState> {
        return this.stateMachine.getInstance(state);
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
        const lockState = !this.character.isLocal();
        this.stateMachine.update(deltaTime, lockState);
    };

    public draw(): void {
        this.stateMachine.draw();
    }
}

export { Player };