import { GameMessage, GMsgType } from "./gameMessage";

type EventFunction = (message: GameMessage) => void;

class Emitter {
    private subscribers: Map<GMsgType, Set<EventFunction>> = new Map();

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

    public publish(message: GameMessage): void {
        const eventSet = this.subscribers.get(message.type);
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