import { Countdown, Grid, Lerp, lerpAngle, lerpEase, SpriteSheet, Utility } from "@common";
import { GameObject } from "@core";
import { SpawnerDescription } from "@game/Map/spawnerDescription";
import { IItem, ItemManager, Ownership } from "@item";
import { Vector } from "@math";
import { Images, zIndex } from "@render";
import { Connection, GameMessage } from "@server";

class Spawner {
    private itemPool: string[];
    private spawnCountdown: Countdown;
    private contains: IItem | null = null;
    private body: GameObject;

    private static yBobbingSpeed: number = 4;
    private static yBobbingMax: number = 3;
    private yBobbingLocation: number = 0;
    private id: number;

    private xPositionLerp = new Lerp(5, lerpEase);
    private yPositionLerp = new Lerp(5, lerpEase);
    private rotationLerp = new Lerp(10, lerpAngle);

    private ballLocation: number = 0;
    private static ballSprite = new SpriteSheet(Images.spawnerBall);
    private static frameSprite = new SpriteSheet(Images.itemSpawner);
    private static frameDrawSize = new Vector(28, 12);

    constructor(config: SpawnerDescription, id: number) {
        this.id = id;

        this.itemPool = config.possibleItems;

        this.spawnCountdown = new Countdown(config.timeBetweenSpawn);

        if (config.startSpawned) {
            this.spawnCountdown.setToReady();
        }
        const size = 25;

        const pos = Grid.getWorldPos(config.pos);
        pos.add(Grid.size / 2);
        pos.subtract(size / 2);

        this.body = new GameObject(pos, size, size);
    }

    public update(deltaTime: number): void {
        this.ballLocation += deltaTime;

        if (this.contains) {
            if (this.contains.shouldBeDeleted()) {
                this.contains = null;
                return;
            }
            if (this.contains.ownership !== Ownership.InSpawner) {
                this.dropContaining();
                return;
            }
            if (this.xPositionLerp.isActive()) {
                const pos = this.contains.body.pos;
                pos.x = this.xPositionLerp.update(deltaTime);
                pos.y = this.yPositionLerp.update(deltaTime);
            } else {
                this.bobItemUpAndDown(deltaTime);
            }
            if (this.rotationLerp.isActive()) {
                this.contains.setAngle(this.rotationLerp.update(deltaTime));
            }
            return;
        }
        this.suckInNewItem();

        if (!Connection.get().isHost()) {
            return;
        }
        this.spawnCountdown.update(deltaTime);
        if (this.spawnCountdown.isDone()) {
            this.spawnNewItem();
        } 
    }

    private bobItemUpAndDown(deltaTime: number): void {
        const itemBody = this.contains!.body;

        const center = this.body.getCenter();
        center.x -= itemBody.width / 2;
        center.y -= itemBody.height / 2;

        this.yBobbingLocation += deltaTime;

        const offset = Spawner.yBobbingMax * Math.sin(this.yBobbingLocation * Spawner.yBobbingSpeed);

        itemBody.pos.y = center.y + offset;
        itemBody.pos.x = center.x;
    }

    public getContaining(): IItem | null {
        return this.contains;
    }

    private dropContaining(): void {
        this.contains = null;
    }

    private spawnNewItem(): void {
        const toSpawn = this.itemPool[Utility.Random.getInteger(0, this.itemPool.length - 1)];

        const noMessage = true;
        const item = ItemManager.create(toSpawn, this.body.pos, noMessage);

        if (!item) {
            console.error("Error updating spawner ", toSpawn, ", doesn't exist");
            return;
        }

        Connection.get().sendGameMessage(GameMessage.SpawnerSpawn, { id: this.id, item: toSpawn, itemId: item.info.id });

        this.spawnCountdown.reset();
        this.setContaining(item);
    }

    private suckInNewItem(): void {
        if (this.contains) {
            return;
        }
        const nearby = ItemManager.getNearby(this.body.pos, this.body.width, this.body.height);
        const maxSpeed = 100;
        for (const item of nearby) {
            const lowEnoughSpeed = Math.abs(item.body.velocity.x) < maxSpeed && Math.abs(item.body.velocity.y) < maxSpeed;
            if (item.body.collision(this.body) && lowEnoughSpeed) {
                this.setContaining(item, true);
                break;
            }
        }
    }

    public setContaining(item: IItem, lerp: boolean = false): void {
        if (this.contains) {
            this.contains.ownership = Ownership.None;
        }
        this.contains = item;

        const itemBody = item.body;
        const center = this.body.getCenter();

        center.x -= itemBody.width / 2;
        center.y -= itemBody.height / 2;

        if (lerp) {
            this.xPositionLerp.startLerp(itemBody.pos.x, center.x);
            this.yPositionLerp.startLerp(itemBody.pos.y, center.y);

            const normalized = Utility.Angle.normalize(item.getAngle());

            const target = Math.abs(normalized) > Math.PI / 2 ? Math.PI : 0;
            this.rotationLerp.startLerp(normalized, target);

        } else {
            itemBody.pos = center;
            item.setAngle(0);
        }

        item.ownership = Ownership.InSpawner;
    }

    public getId(): number {
        return this.id;
    }

    public draw(): void {
        const ballDrawSize = 8;

        const maxOffsetX = 20;
        const maxOffsetY = 5;
        const maxScaleOffset = 0.25;

        const speed = 5;
        const phase = this.ballLocation * speed;

        const center = this.body.getCenter();

        const sin = Math.sin(phase);
        const cos = Math.cos(phase);

        const ballScale = 1 + cos * maxScaleOffset;

        const offsetX = sin * maxOffsetX;
        const offsetY = cos * maxOffsetY;

        const ball1Size = ballDrawSize * ballScale;
        const ball2Size = ballDrawSize * (2 - ballScale);

        const ball1Pos = center.clone().subtract(ball1Size / 2);
        ball1Pos.x += offsetX;
        ball1Pos.y += offsetY;

        const ball2Pos = center.clone().subtract(ball2Size / 2);
        ball2Pos.x -= offsetX;
        ball2Pos.y -= offsetY;

        const frontBall = cos > 0 ? 1 : 2;

        const framePos = center;
        const frameYOffset = 6;

        framePos.x -= Spawner.frameDrawSize.x / 2;
        framePos.y = this.body.pos.y + Grid.size / 2 + this.body.height / 2 - Spawner.frameDrawSize.y + frameYOffset;

        Spawner.frameSprite.draw(framePos, Spawner.frameDrawSize, false, 0, zIndex.Spawners);
        if (this.contains) {
            this.contains.draw();
        }
        if (frontBall === 1) {
            Spawner.ballSprite.draw(ball1Pos, ball1Size, false, 0, zIndex.Spawners + 10);
            Spawner.ballSprite.draw(ball2Pos, ball2Size, false, 0, zIndex.Spawners - 10);
        } else {
            Spawner.ballSprite.draw(ball1Pos, ball1Size, false, 0, zIndex.Spawners - 10);
            Spawner.ballSprite.draw(ball2Pos, ball2Size, false, 0, zIndex.Spawners + 10);
        }
    }
}

export { Spawner };