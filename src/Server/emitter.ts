import { GameMessageMap, GMsgType } from "./gameMessage";

type EventFunction = (message: GameMessageMap) => void;

class Emitter {
    private subscribers: {
        [K in GMsgType]: Set<Emitter(message: GameMessageMap[K]) => void;
    public subscribe(event: GMsgType, listenFunction: EventFunction): void {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, new Set());
        }
        this.subscribers.get(event)!.add(listenFunction);
    }

    public unsubscribe(event: GMsgType, listener: EventFunction): void {
        const eventSet = this.subscribers.get(event)
        if (!eventSet) {
            return;
        }
        eventSet.delete(listener);
    }

    public publish(message: GameMessageMap): void {
        const eventSet = this.subscribers.get(message);
        if (!eventSet) {
            return
        }
        for (const listener of eventSet.values()) {
            listener(message);
        }
    }

    public removeAll(): void {
        this.subscribers.clear();
    }
}

export { Emitter }