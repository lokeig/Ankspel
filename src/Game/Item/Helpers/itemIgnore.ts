import { DynamicObject } from "@core";

class ItemIgnore {
    private ignoring: Map<DynamicObject, { time: number }> = new Map();

    public update(deltaTime: number) {
        this.ignoring.forEach((object, body) => {
            object.time -= deltaTime;
            if (object.time < 0) {
                this.ignoring.delete(body);
            }
        });
    }

    public set(body: DynamicObject, time: number): void {
        this.ignoring.set(body, { time });
    }

    public has(body: DynamicObject): boolean {
        return this.ignoring.has(body);
    }
}

export { ItemIgnore };