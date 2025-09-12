import { ServerMessage } from "./MessageTypes/messageType";

export interface ServerInterface {
    getReceivedMessages(): Array<ServerMessage>;
    sendMessage(text: ServerMessage): void;
    getID(): string | null;
    getPeerIDs(): Array<string>;
    update(): void;
}