import { Grid, PlayerState, Utility, Vector } from "@common";
import { Player } from "./player";
import { IDManager } from "@game/Common/IDManager/idManager";
import { Connection, GameMessage } from "@server";
import { IItem, ItemManager, Ownership } from "@item";
import { PlayerRagdoll } from "./PlayerStates";

class PlayerManager {
    private static players: Map<string, Set<Player>> = new Map();
    private static idManager = new IDManager<Player>();
    private static localPlayerCount = 0;

    static update(deltaTime: number) {
        const pending: Player[] = [];

        const updatePlayer = (player: Player) => {
            if (player.character.isLocal()) {
                this.setNearbyItems(player);
            }
            player.update(deltaTime);
            player.character.equipment.getAllEquippedItems().forEach((item, slot) => {
                if (item && item.shouldBeDeleted()) {
                    player.character.equipment.equip(null, slot);
                }
            })
        };
        this.getPlayers().forEach(player => {
            if (player.held()) {
                pending.push(player);
                return;
            }
            updatePlayer(player);
        });
        pending.forEach(updatePlayer);
        Grid.updateMapPositions<Player>(this.players, player => player.character.body.pos);
    }

    public static getLocal(): Player[] {
        const result: Player[] = [];
        this.players.forEach(playerSet => { playerSet.forEach(player => { if (player.character.isLocal()) { result.push(player); } }) });
        return result;
    }

    public static getPlayers(): Player[] {
        const result: Player[] = [];
        this.players.forEach(playerSet => { playerSet.forEach(player => { result.push(player); }) });
        return result;
    }

    private static setNearbyItems(player: Player): void {
        const items: IItem[] = ItemManager.getNearby(player.character.body.pos, player.character.body.width, player.character.body.height);
        this.getPlayers().forEach(player => {
            if (player.getCurrentState() === PlayerState.Ragdoll) {
                items.push(player.getStateInstance(PlayerState.Ragdoll) as PlayerRagdoll);
            }
        })
        player.setNearbyItems(items);
    }

    public static create(): Player {
        const player = new Player(this.idManager.getNextID());
        const id = this.idManager.add(player);
        this.addPlayer(player);
        player.setControls(Utility.File.getControls(this.localPlayerCount++));
        Connection.get().sendGameMessage(GameMessage.NewPlayer, ({ id }));
        return player;
    }

    public static spawn(id: number): Player {
        const player = new Player(id);
        this.idManager.setID(player, id);
        this.addPlayer(player);
        return player;
    }

    private static addPlayer(player: Player) {
        const pos = Grid.key(new Vector());
        const playerSet = this.players.get(pos);
        if (!playerSet) {
            this.players.set(pos, new Set());
        }
        this.players.get(pos)!.add(player);
    }

    public static draw() {
        this.getPlayers().forEach(player => {
            if (!player.held()) {
                player.draw();
            }
        })
    }

    public static getPlayerFromID(ID: number): Player | undefined {
        return this.idManager.getObject(ID);
    }

    public static getPlayerID(player: Player): number | undefined {
        return this.idManager.getID(player);
    }
}

export { PlayerManager };