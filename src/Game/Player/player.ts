import { Vector } from "@math";
import { Controls, Grid, IState, SpriteSheet, StateMachine, Utility } from "@common";
import { PlayerCharacter } from "./Character/playerCharacter";
import { PlayerState, PlayerStandard, PlayerFlap, PlayerSlide, PlayerRagdoll } from "./PlayerStates";
import { ItemManager, Ownership } from "@item";
import { Connection, GameMessage } from "@server";
import { Images, zIndex } from "@render";
import { PlayerSpawnDescription } from "@game/Map/PlayerSpawnDescription";
import { AudioManager, Sound } from "@game/Audio";

class Player {
    public character!: PlayerCharacter;
    private stateMachine: StateMachine<PlayerState>;
    private id: number;
    private score: number = 0;
    private gettingScore: boolean = false;
    private color: string;
    private name: string;

    private static plusOneSheet = new SpriteSheet(Images.plusOne);

    constructor(id: number, color: string, name: string, controls?: Controls) {
        this.stateMachine = new StateMachine<PlayerState>(PlayerState.Standard);
        this.id = id;

        this.color = color;
        this.name = name;

        this.character = new PlayerCharacter(new Vector(), id, color);
        if (controls) {
            this.character.setControls(controls);
        }
        this.setupStateMachine();
    }

    public getColor(): string {
        return this.color;
    }

    public getName(): string {
        return this.name;
    }

    public givePoint(): void {
        this.score++;
        this.gettingScore = true;
        AudioManager.get().play(Sound.score);
    }

    public getScore(): number {
        return this.score;
    }

    public setSpawn(spawn: PlayerSpawnDescription): void {
        const worldPos = Grid.getWorldPos(spawn.pos);
        worldPos.y -= this.character.standardBody.height;
        worldPos.x += (Grid.size - this.character.standardBody.width) / 2;

        this.character.setPos(worldPos);
        this.character.standardBody.direction = spawn.direction;

        Connection.get().sendGameMessage(GameMessage.PlayerSpawn, { id: this.id, pos: Utility.Vector.convertToNetwork(worldPos) });
    }

    public getId(): number {
        return this.id;
    }

    public held(): boolean {
        const ragdoll = this.stateMachine.getInstance(PlayerState.Ragdoll) as PlayerRagdoll;
        return ragdoll.getOwnership() !== Ownership.None;
    }

    public reload(): void {
        this.stateMachine.forceState(PlayerState.Standard);
        this.character.reset();
        this.stateMachine.enterState();
        this.gettingScore = false;
    }

    public reset(): void {
        this.reload();
        this.score = 0;
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

        if (this.gettingScore) {
            const drawSize = new Vector(38, 30);
            const drawPos = this.character.activeBody.pos.clone();
            drawPos.x += this.character.activeBody.width / 2;
            drawPos.y += this.character.activeBody.height;
            drawPos.y -= 70;
            drawPos.subtract((drawSize).clone().divide(2));

            Player.plusOneSheet.draw(drawPos, drawSize, false, 0, zIndex.UI);
        }

    }
}

export { Player };