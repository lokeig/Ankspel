import { ClientMessage } from "@shared";
import { Emitter } from "./emitter";

interface ServerInterface {
    emitter: Emitter;
    sendMessage(text: any): void;
    sendToServer(message: ClientMessage): void;
    isHost(): boolean;
}

export type { ServerInterface }