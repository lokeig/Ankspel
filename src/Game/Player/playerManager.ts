import { IDManager } from "@common";
import { Player } from "./player";
import { Connection, GameMessage } from "@server";
import { MainMenu } from "@menu";

class PlayerManager {
    private static players: Set<Player> = new Set();
    private static localPlayerCount = 0;

    public static update(deltaTime: number, maxY: number) {
        const pending: Player[] = [];

        const updatePlayer = (player: Player) => {
            if (!player.isEnabled()) {
                return;
            }
            player.update(deltaTime);
            player.character.equipment.getAllEquippedItems().forEach((item, slot) => {
                if (item && (item.shouldBeDeleted() || !item.enabled())) {
                    player.character.equipment.equip(null, slot);
                }
            });
            const fallingOffMapDistance = 100;
            if (!player.character.isDead() && player.character.activeBody.pos.y > maxY + fallingOffMapDistance) {
                player.character.die(true);
            }
        };
        this.getEnabled().forEach(player => {
            if (player.held()) {
                pending.push(player);
                return;
            }
            updatePlayer(player);
        });
        pending.forEach(updatePlayer);
    }

    public static reload(): void {
        this.getPlayers().forEach(player => player.reload());
    }

    public static reset(): void {
        this.getPlayers().forEach(player => player.reset());
    }

    public static getLocal(): Player[] {
        return Array.from(this.players).filter(player => player.character.isLocal());   
    }

    public static getEnabled(): Player[] {
        return Array.from(this.players).filter(player => player.isEnabled());
    }

    public static getPlayers(): Player[] {
        return Array.from(this.players);
    }

    public static removePlayer(id: number): Player | undefined {
        const player = this.getPlayerFromID(id);
        if (!player) {
            return undefined;
        }
        if (player.character.isLocal()) {
            this.localPlayerCount--;
        }
        this.players.delete(player);
        return player;
    }

    public static create(): Player {
        const mainMenu = MainMenu.get();

        const color = mainMenu.getChosenColor(this.localPlayerCount);
        const name = mainMenu.getName(this.localPlayerCount);
        const controls = mainMenu.getControls(this.localPlayerCount);

        const id = IDManager.getBaseOffset() + this.localPlayerCount++;

        const player = new Player(id, color, name, controls);
        this.players.add(player);

        Connection.get().sendGameMessage(GameMessage.NewPlayer, ({ id, color, name }));

        return player;
    }

    public static spawn(id: number, color: string, name: string): Player {
        const player = new Player(id, color, name);
        this.players.add(player);
        return player;
    }

    public static draw() {
        this.players.forEach(player => {
            if (!player.isEnabled()) {
                return;
            }
            if (player.held()) {
                return;
            }
            player.draw();
        })
    }

    public static getPlayerFromID(id: number): Player | undefined {
        for (const player of this.players) {
            if (player.getId() === id) {
                return player;
            }
        }
        return undefined;
    }
}

export { PlayerManager };