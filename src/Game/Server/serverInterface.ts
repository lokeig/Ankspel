import { ClientMessage } from "@shared";
import { Emitter } from "./emitter";
import { GameMessageMap, GMsgType } from "./gameMessage";

interface ServerInterface {
    emitter: Emitter;
    getID(): string;
    sendMessage<T extends GMsgType>(type: T, text: GameMessageMap[T]): void;
    sendToServer(message: ClientMessage): void;
    isHost(): boolean;
}

export type { ServerInterface }