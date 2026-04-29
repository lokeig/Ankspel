import { Vector } from "@math";
import { Controls, Grid, IState, SpriteSheet, StateMachine, Utility } from "@common";
import { PlayerCharacter } from "./Character/playerCharacter";
import { PlayerState, PlayerStandard, PlayerFlap, PlayerSlide, PlayerRagdoll } from "./PlayerStates";
import { ItemManager, Ownership } from "@item";
import { Connection, GameMessage } from "@server";
import { PlayerSpawnDescription } from "@game/Map/PlayerSpawnDescription";
import { AudioManager, Sound } from "@game/Audio";
import { Images, zIndex } from "@render";
import { PlayerNetted } from "./PlayerStates/playerNetted";

class Player {
    public character!: PlayerCharacter;
    private enabled: boolean = false;
    private stateMachine: StateMachine<PlayerState>;
    private id: number;

    private score: number = 0;
    private trophies: number = 0;

    private color: string;
    private name: string;
    private gettingScore: boolean = false;
    private gettingWin: boolean = false;
    private static plusOneSheet = new SpriteSheet(Images.plusOne);
    private static plusTrophySheet = new SpriteSheet(Images.plusWin);

    constructor(id: number, color: string, name: string, controls?: Controls) {
        this.stateMachine = new StateMachine<PlayerState>(PlayerState.Standard);
        this.id = id;

        this.name = name;
        this.color = this.getCleanedUpColor(color);

        this.character = new PlayerCharacter(new Vector(), id, this.color);
        if (controls) {
            this.character.setControls(controls);
        }
        this.setupStateMachine();
    }

    private setupStateMachine(): void {
        this.stateMachine.addState(PlayerState.Standard, new PlayerStandard(this.character));
        this.stateMachine.addState(PlayerState.Flap, new PlayerFlap(this.character));
        const crouch = true;
        this.stateMachine.addState(PlayerState.Crouch, new PlayerSlide(this.character, crouch));
        this.stateMachine.addState(PlayerState.Slide, new PlayerSlide(this.character, !crouch));

        const ragdoll = new PlayerRagdoll(this.character, this.id);
        const netted = new PlayerNetted(this.character, this.id + 50);

        ItemManager.addPermanent(ragdoll, this.id);
<<<<<<< HEAD
        ItemManager.addPermanent(netted, this.id + 50);
=======
        ItemManager.addPermanent(netted, this.id + 10);
>>>>>>> 4c16af84934d144569ef0e220d3c1a39edb26d85

        this.stateMachine.addState(PlayerState.Ragdoll, ragdoll);
        this.stateMachine.addState(PlayerState.Net, netted);

        this.stateMachine.enterState();
    }

    private getCleanedUpColor(original: string): string {
        let R = Number("0x" + original.substring(1, 3));
        let G = Number("0x" + original.substring(3, 5));
        let B = Number("0x" + original.substring(5, 7));

        // https://stackoverflow.com/questions/596216/formula-to-determine-perceived-brightness-of-rgb-color
        const brightness = (0.2126 * R + 0.7152 * G + 0.0722 * B) / 255;
        const factor = brightness > 0.5 ? 20 : 50;
        const offset = (1 - (brightness * 2)) * factor;

        const handleColor = (color: number): string => {
            color += offset;
            color = Math.max(Math.min(Math.floor(color), 255), 0);
            let str = color.toString(16);
            if (str.length === 1) {
                str = "0" + str;
            }
            return str;
        }

        return "#" + handleColor(R) + handleColor(G) + handleColor(B);
    }

    public lockControls(lock: string): void {
        this.character.controls.addLock(lock);
    }

    public unlockControls(lock: string): void {
        this.character.controls.removeLock(lock);
    }

    public setEnabled(state: boolean, local: boolean = true) {
        if (local) {
            Connection.get().sendGameMessage(GameMessage.PlayerEnabled, { id: this.id, state });
        }
        this.enabled = state;
    }

    public isEnabled(): boolean {
        return this.enabled;
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

    public setScore(score: number): void {
        this.givePoint();
        this.score = score;
    }

    public getScore(): number {
        return this.score;
    }

    public win(): void {
        this.gettingWin = true;
        this.trophies++;
        AudioManager.get().play(Sound.win);
    }

    public setWins(trophies: number): void {
        this.win();
        this.trophies = trophies;
    }

    public getWins(): number {
        return this.trophies;
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
        const netted = this.stateMachine.getInstance(PlayerState.Net) as PlayerNetted;

        return ragdoll.ownership !== Ownership.None || netted.ownership !== Ownership.None;
    }


    public reload(): void {
        this.gettingScore = false;
        this.gettingWin = false;
        this.stateMachine.forceState(PlayerState.Standard);
        this.character.reset();
        this.stateMachine.enterState();
    }

    public reset(): void {
        this.score = 0;
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
        if (this.gettingScore || this.gettingWin) {
            const body = this.character.activeBody;
            const drawSize = new Vector(38, 30);

            const drawPos = body.pos.clone();
            drawPos.x += body.width / 2;
            drawPos.y += body.height;
            drawPos.y -= 70;
            drawPos.subtract((drawSize).clone().divide(2));

            const sprite = this.gettingScore ? Player.plusOneSheet : Player.plusTrophySheet;
            sprite.draw(drawPos, drawSize, false, 0, zIndex.UI);
        }
    }
}

export { Player };