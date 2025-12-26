type ListenFunction<TMessageMap, TKey extends keyof TMessageMap> = (msg: TMessageMap[TKey]) => void;

class Emitter<TMessageMap> {
    private subscribers: { [K in keyof TMessageMap]: Set<ListenFunction<TMessageMap, K>> };

    constructor() {
        this.subscribers = {} as { [K in keyof TMessageMap]: Set<ListenFunction<TMessageMap, K>> };
    }

    public subscribe<TKey extends keyof TMessageMap>(type: TKey, listenFunction: ListenFunction<TMessageMap, TKey>): void {
        if (!this.subscribers[type]) {
            this.subscribers[type] = new Set();
        }
        this.subscribers[type].add(listenFunction);
    }

    public unsubscribe<TKey extends keyof TMessageMap>(type: TKey, listenFunction: ListenFunction<TMessageMap, TKey>): void {
        if (!this.subscribers[type]) {
            return;
        }
        this.subscribers[type].delete(listenFunction);
    }

    public publish<T extends keyof TMessageMap>(type: T, message: TMessageMap[T]): void {
        if (!this.subscribers[type]) {
            return;
        }
        for (const listenFunction of this.subscribers[type].values()) {
            listenFunction(message);
        }
    }
}

export { Emitter };