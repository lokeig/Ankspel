import { IDManager, Utility } from "@common";
import { Player } from "./player";
import { Connection, GameMessage } from "@server";
import { ImageInfo, ImageName, Images } from "@render";

class PlayerManager {
    private static players: Player[] = [];
    private static localPlayerCount = 0;

    public static update(deltaTime: number, maxY: number) {
        const pending: Player[] = [];

        const updatePlayer = (player: Player) => {
            player.update(deltaTime);
            player.character.equipment.getAllEquippedItems().forEach((item, slot) => {
                if (item && item.shouldBeDeleted()) {
                    player.character.equipment.equip(null, slot);
                }
            });
            const fallingOffMapDistance = 100;
            if (!player.character.isDead() && player.character.activeBody.pos.y > maxY + fallingOffMapDistance) {
                player.character.die();
            }
        };
        this.getPlayers().forEach(player => {
            if (player.held()) {
                pending.push(player);
                return;
            }
            updatePlayer(player);
        });
        pending.forEach(updatePlayer);
    }

    public static reset(): void {
        this.getPlayers().forEach(player => {
            player.reset();
        });
    }

    public static getLocal(): Player[] {
        return this.getPlayers().filter(player => player.character.isLocal());
    }

    public static getPlayers(): Player[] {
        return this.players;
    }

    public static create(color: ImageName): Player {
        const controls = Utility.File.getControls(this.localPlayerCount);
        const id = IDManager.getBaseOffset() + this.localPlayerCount++;

        const player = new Player(id, color, controls);
        this.players.push(player);

        Connection.get().sendGameMessage(GameMessage.NewPlayer, ({ id, color }));

        return player;
    }

    public static spawn(id: number, color: ImageName): Player {
        const player = new Player(id, color);
        this.players.push(player);  
        return player;
    }

    public static draw() {
        this.players.forEach(player => {
            if (!player.held()) {
                player.draw();
            }
        })
    }

    public static getPlayerFromID(id: number): Player | undefined {
        return this.players.find(player => player.getId() === id);
    }
}

export { PlayerManager };