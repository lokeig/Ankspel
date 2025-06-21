import { Cooldown } from "../../Common/cooldown";

export class ExplosiveInfo {
    public radius: Number = 5;
    private activated: boolean = false;
    private explosionDelay: Cooldown;
    private exploded: boolean = false;

    constructor(explosionDelay: number) {
        this.explosionDelay = new Cooldown(explosionDelay);
    }

    public update(deltaTime: number): void {
        if (this.activated) {
            this.explosionDelay.update(deltaTime);
        }
        if (this.explosionDelay.isReady()) {
            // Create explosion projectiles here
            this.exploded = true;
            console.log("WE EXPLODING NOW");
        }
    }

    public hasExploded(): boolean {
        return this.exploded;
    }

    public activate(): void {
        this.activated = true;
    }

    public isActivated(): boolean {
        return this.activated;
    }
}