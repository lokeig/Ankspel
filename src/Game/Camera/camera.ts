import { Vector } from "@math";
import { Player, PlayerManager } from "@player";
import { Render } from "@render";

type Positions = { minX: number, maxX: number, minY: number, maxY: number };

class Camera {
    private currentPos: Vector = new Vector();
    private currentZoom: number = 1;

    public update(deltaTime: number) {
        const players = PlayerManager.getPlayers().filter(player => !player.character.isDead());
        if (players.length == 0) {
            this.setFrame(this.getCenter(), 1, deltaTime);
            return;
        }
        
        const positions = this.getPositions(players);
        const targetPos = this.calculateTargetPos(positions);
        const targetZoom = this.calculateTargetZoom(positions, 200);
        this.setFrame(targetPos, targetZoom, deltaTime);
    }

    private getCenter(): Vector {
        return new Vector(Render.get().getWidth(), Render.get().getHeight()).divide(2);
    }

    public initialize(): void {
        const players = PlayerManager.getPlayers();

        const positions = this.getPositions(players);
        const targetPos = this.calculateTargetPos(positions);
        const targetZoom = this.calculateTargetZoom(positions, 200);

        this.currentPos = targetPos;
        this.currentZoom = targetZoom;

        Render.get().setCamera(this.currentPos, this.currentZoom);
    }

    private setFrame(targetPos: Vector, targetZoom: number, deltaTime: number) {
        const smoothFactor = 3;
        this.currentPos.x += (targetPos.x - this.currentPos.x) * deltaTime * smoothFactor;
        this.currentPos.y += (targetPos.y - this.currentPos.y) * deltaTime * smoothFactor;
        this.currentZoom += (targetZoom - this.currentZoom) * deltaTime * smoothFactor;

        Render.get().setCamera(this.currentPos, this.currentZoom);
    }

    private getPositions(players: Player[]): Positions {        
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        for (const player of players) {
            const pos = player.character.standardBody.getCenter();
            if (pos.x < minX) {
                minX = pos.x;
            }
            if (pos.x > maxX) {
                maxX = pos.x;
            }
            if (pos.y < minY) {
                minY = pos.y;
            }
            if (pos.y > maxY) {
                maxY = pos.y;
            }
        }
        return { minX, maxX, minY, maxY };
    }

    private calculateTargetPos(positions: Positions): Vector {
        const { minX, maxX, minY, maxY } = positions;
        return new Vector(minX + maxX, minY + maxY).divide(2);
    }

    private calculateTargetZoom(positions: Positions, padding: number): number {
        const { minX, maxX, minY, maxY } = positions;

        const width = (maxX - minX) + padding;
        const height = (maxY - minY) + padding;

        const zoomX = Render.get().getWidth() / width;
        const zoomY = Render.get().getHeight() / height;

        return Math.min(zoomX, zoomY);
    }
}

export { Camera };