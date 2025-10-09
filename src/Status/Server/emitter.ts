type EventListener = (message: any) => void;

export class Emitter {
    private subscribers: Map<string, Set<EventListener>> = new Map();

    public subscribe(event: string, listener: EventListener): void {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, new Set());
        }
        this.subscribers.get(event)!.add(listener);
    }

    public unsubscribe(event: string, listener: EventListener): void {
        const ev = this.subscribers.get(event)
        if (!ev) {
            return;
        }
        ev.delete(listener);
    }

    public once(event: string, listener: EventListener): void {
        const wrapper: EventListener = (message: any) => {
            listener(message);
            this.unsubscribe(event, wrapper);
        };
        this.subscribe(event, wrapper);
    }

    public emit(event: string, message: any): void {
        const ev = this.subscribers.get(event);
        if (!ev) {
            return
        }
        for (const listener of ev.values()) {
            listener(message);
        }
    }

    public removeAll(): void {
        this.subscribers.clear();
    }
}