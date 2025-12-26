import { ClientMessage, ServerMessageMap } from "@shared";
import { Emitter } from "./emitter";
import { GameMessage, GameMessageMap } from "./gameMessage";

interface IServer {
    gameEvent: Emitter<GameMessageMap>;
    serverEvent: Emitter<ServerMessageMap>;
    isHost(): boolean;
    getID(): string;
    connectionCount(): number;
    sendGameMessage<T extends GameMessage>(type: T, text: GameMessageMap[T]): void;
    sendClientMessage(text: ClientMessage): void;
}

export type { IServer };