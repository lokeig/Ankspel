import { MaxMinPositions } from "@common";
import { Vector } from "@math";
import { Player, PlayerManager } from "@player";
import { Render } from "@render";

class Camera {
    private currentPos: Vector = new Vector();
    private currentZoom: number = 1;
    private targetZoom: number = 1;
    private targetPos: Vector = new Vector();

    private timeDead: Map<Player, { time: number }> = new Map();
    private static timeDeadPlayerCounts: number = 2;

    public update(deltaTime: number, bounds: MaxMinPositions) {
        this.timeDead.forEach(wrapper => wrapper.time += deltaTime);

        const players = PlayerManager.getPlayers().filter(player => {
            if (player.character.isDead() && !this.timeDead.has(player)) {
                this.timeDead.set(player, { time: 0 });
            }
            const death = this.timeDead.get(player);
            if (!death) {
                return true;
            }
            return death.time < Camera.timeDeadPlayerCounts;
        });

        if (players.length == 0) {
            this.setFrame(this.targetPos, this.targetZoom, deltaTime);
            return;
        }
        const positions = this.getPositions(players, bounds);
        this.targetPos = this.calculateTargetPos(positions);
        this.targetZoom = this.calculateTargetZoom(positions, 200);

        this.setFrame(this.targetPos, this.targetZoom, deltaTime);
    }

    public initialize(bounds: MaxMinPositions): void {
        this.timeDead = new Map();
        const players = PlayerManager.getPlayers();

        const positions = this.getPositions(players, bounds);
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

    private getPositions(players: Player[], bounds: MaxMinPositions): MaxMinPositions {
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
        const minYPadding = 1000;
        minX = Math.min(bounds.maxX, Math.max(bounds.minX, minX));
        maxX = Math.min(bounds.maxX, Math.max(bounds.minX, maxX));
        minY = Math.min(bounds.maxY, Math.max(bounds.minY - minYPadding, minY));
        maxY = Math.min(bounds.maxY, Math.max(bounds.minY - minYPadding, maxY));

        return { minX, maxX, minY, maxY };
    }

    public getCurrentPos(): Vector {
        return this.currentPos.clone();
    }

    private calculateTargetPos(positions: MaxMinPositions): Vector {
        const { minX, maxX, minY, maxY } = positions;
        return new Vector(minX + maxX, minY + maxY).divide(2);
    }

    private calculateTargetZoom(positions: MaxMinPositions, padding: number): number {
        const { minX, maxX, minY, maxY } = positions;

        const width = (maxX - minX) + padding;
        const height = (maxY - minY) + padding;

        const zoomX = Render.get().getWidth() / width;
        const zoomY = Render.get().getHeight() / height;

        return Math.min(zoomX, zoomY);
    }
}

export { Camera };