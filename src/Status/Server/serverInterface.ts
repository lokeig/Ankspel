import { Emitter } from "./emitter";
import { ServerMessage } from "./MessageTypes/messageType";

export interface ServerInterface {
    emitter: Emitter;
    getID(): string | null;
    sendMessage(text: ServerMessage): void;
    sendToServer(message: any): void;
    clearMessages(): void;
    getReceivedMessages(): Array<ServerMessage>;
}