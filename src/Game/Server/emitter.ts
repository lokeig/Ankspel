import { GameMessageMap, GMsgType } from "./gameMessage";

type ListenFunction<T extends GMsgType> = (msg: GameMessageMap[T]) => void;

class Emitter {
    private subscribers: { [K in GMsgType]: Set<ListenFunction<K>> };

    constructor() {
        this.subscribers = {} as { [K in GMsgType]: Set<ListenFunction<K>> };
        for (const key of Object.values(GMsgType)) {
            this.subscribers[key] = new Set<ListenFunction<typeof key>>();
        }
    }

    public subscribe<T extends GMsgType>(type: T, listenFunction: ListenFunction<T>): void {
        this.subscribers[type].add(listenFunction);
    }

    public unsubscribe<T extends GMsgType>(type: T, listenFunction: ListenFunction<T>): void {
        this.subscribers[type].delete(listenFunction);
    }

    public publish<T extends GMsgType>(type: T, message: GameMessageMap[T]): void {
        for (const listenFunction of this.subscribers[type].values()) {
            listenFunction(message);
        }
    }
}

export { Emitter };