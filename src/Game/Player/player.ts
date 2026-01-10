import { Controls, StateMachine, Vector } from "@common";
import { PlayerCharacter } from "./Character/playerCharacter";
import { PlayerState, PlayerStandard, PlayerFlap, PlayerSlide, PlayerRagdoll } from "./PlayerStates";
import { TileManager } from "@game/StaticObjects/Tiles";
import { Render } from "@render";

class Player {
    public character!: PlayerCharacter;
    private stateMachine: StateMachine<PlayerState>;

    constructor() {
        this.stateMachine = new StateMachine<PlayerState>(PlayerState.Standard);
        this.character = new PlayerCharacter(new Vector());
        this.setupStateMachine();
    }

    public setControls(controls: Controls) {
        this.character.setControls(controls);
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


    public setState(state: PlayerState): void {
        if (state !== this.stateMachine.getState()) {
            this.stateMachine.forceState(state);
        }
    }

    public getState(): PlayerState {
        return this.stateMachine.getState();
    }

    public update(deltaTime: number): void {
        const noStateChange = this.character.isLocal() ? false : true;
        this.stateMachine.update(deltaTime, noStateChange);
    };

    public draw(): void {
        TileManager.getNearbyTiles(this.character.body.pos, this.character.body.width, this.character.body.height).forEach(tile => {
            Render.get().drawSquare({
                x: tile.gameObject.pos.x,
                y: tile.gameObject.pos.y,
                width: tile.gameObject.width,
                height: tile.gameObject.height
            }, 0, "green");
        });
        this.stateMachine.getIState().draw();
    }
}

export { Player };