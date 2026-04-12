import { MaxMinPositions } from "@common";
import { Vector } from "@math";
import { Player, PlayerManager } from "@player";
import { Render } from "@render";

class Camera {
    private currentPos: Vector = new Vector();
    private currentZoom: number = 1;
    private targetZoom: number = 1;
    private targetPos: Vector = new Vector();

    private deadPlayers: Map<Player, { time: number, pos: Vector }> = new Map();
    private static deathDelay: number = 1;

    public update(deltaTime: number, bounds: MaxMinPositions) {
        this.deadPlayers.forEach(wrapper => wrapper.time += deltaTime);

        const playerPositions: Vector[] = [];

        PlayerManager.getEnabled().forEach(player => {
            const pos = player.character.activeBody.getCenter();

            if (player.character.isDead() && !this.deadPlayers.has(player)) {
                this.deadPlayers.set(player, { time: 0, pos: pos.clone() });
            }
            const death = this.deadPlayers.get(player);
            if (!death) {
                playerPositions.push(pos);
            } else if (death.time < Camera.deathDelay) {
                playerPositions.push(death.pos);
            }
        });

        if (playerPositions.length == 0) {
            this.setFrame(this.targetPos, this.targetZoom, deltaTime);
            return;
        }

        const positions = this.getPositions(playerPositions, bounds);
        this.targetPos = this.calculateTargetPos(positions);
        this.targetZoom = this.calculateTargetZoom(positions, 200);

        this.setFrame(this.targetPos, this.targetZoom, deltaTime);
    }

    public initialize(bounds: MaxMinPositions): void {
        this.deadPlayers = new Map();
        const players = PlayerManager.getEnabled().map(player => player.character.activeBody.getCenter());

        const positions = this.getPositions(players, bounds);
        const targetPos = this.calculateTargetPos(positions);
        const targetZoom = this.calculateTargetZoom(positions, 200);

        this.currentPos = targetPos;
        this.currentZoom = targetZoom;

        Render.get().setCamera(this.currentPos, this.currentZoom);
    }

    private setFrame(targetPos: Vector, targetZoom: number, deltaTime: number) {
        const smoothFactor = 3;
        let diffX = (targetPos.x - this.currentPos.x) * deltaTime * smoothFactor;
        let diffY = (targetPos.y - this.currentPos.y) * deltaTime * smoothFactor;

        const max = 0.1;
        if (Math.abs(diffX) < max) {
            diffX = 0;
        }
        if (Math.abs(diffY) < max) {
            diffY = 0;
        }
        this.currentPos.x += diffX;
        this.currentPos.y += diffY;

        let zoomDiff = (targetZoom - this.currentZoom) * deltaTime * smoothFactor;
        if (Math.abs(zoomDiff) < 0.005) {
            zoomDiff = 0;
        }
        this.currentZoom += zoomDiff;

        Render.get().setCamera(this.currentPos, this.currentZoom);
    }

    private getPositions(players: Vector[], bounds: MaxMinPositions): MaxMinPositions {
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        for (const pos of players) {
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