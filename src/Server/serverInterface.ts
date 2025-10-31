import { ClientMessage } from "@shared";
import { Emitter } from "./emitter";
import { GameMessage, GMsgType } from "./gameMessage";

interface ServerInterface {
    emitter: Emitter;
    sendMessage(type: GMsgType, text: GameMessage): void;
    sendToServer(message: ClientMessage): void;
    isHost(): boolean;
}

export type { ServerInterface }