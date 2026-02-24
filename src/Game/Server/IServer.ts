import { ClientMessage, ServerMessageMap } from "@shared";
import { Emitter } from "./emitter";
import { GameMessage, GameMessageMap } from "./gameMessage";

interface IServer {
    gameEvent: Emitter<GameMessageMap>;
    serverEvent: Emitter<ServerMessageMap>;

    enableLocalMode(): void;
    connectionCount(): number;
    getID(): string;
    isHost(): boolean;
    
    sendGameMessage<T extends GameMessage>(type: T, text: GameMessageMap[T]): void;
    sendGameMessageUnreliable<T extends GameMessage>(type: T, text: GameMessageMap[T]): void;
    sendClientMessage(text: ClientMessage): void;

    onGameStart(callback: (gameId: number) => void): void;
}

export type { IServer };