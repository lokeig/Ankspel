import { ServerMessage } from "./serverMessage";

export interface ServerInterface {
    getReceivedMessages(): Array<ServerMessage>;
    sendMessage(text: ServerMessage): void;
    getID(): string | null;
    update(): void;
}