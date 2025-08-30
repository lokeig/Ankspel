import { MessageType } from "./MessageTypes/messageType";

export type ServerMessage = {
    type: MessageType;
    message: string;
};

