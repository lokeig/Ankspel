import { ClientMessage } from "@shared";
import { Emitter } from "./emitter";

interface ServerInterface {
    emitter: Emitter;
    getID(): string | null;
    sendMessage(text: any): void;
    sendToServer(message: ClientMessage): void;
    clearMessages(): void;
    getReceivedMessages(): Array<any>;
}

export type { ServerInterface }