import { LobbyMessageData } from "./lobbyMessageData";

enum ServerMessage {
    forwarded = "forwarded",
    connected = "connected",
    joinSuccess = "joinSuccess",
    leaveSuccess = "leaveSuccess",
    hostSuccess = "hostSuccess",
    newHost = "newHost",
    startGame = "startGame",
    lobbyList = "lobbyList",
    userList = "userList",
    userJoined = "userJoined",
    userLeft = "userLeft",
}

type ForwardedMessage<T = unknown> = {
    from: string;
    msg: T;
};

interface ServerMessageMap {
    [ServerMessage.forwarded]: { from: string, msg: ForwardedMessage };
    [ServerMessage.connected]: { clientID: string };
    [ServerMessage.joinSuccess]: { lobbyID: string };
    [ServerMessage.leaveSuccess]: {};
    [ServerMessage.hostSuccess]: { lobbyID: string };
    [ServerMessage.newHost]: { hostID: string };
    [ServerMessage.startGame]: { userID: number };
    [ServerMessage.lobbyList]: { lobbies: LobbyMessageData[] };
    [ServerMessage.userList]: { users: string[] };
    [ServerMessage.userJoined]: { userID: string };
    [ServerMessage.userLeft]: { userID: string };
}

export type { ServerMessageMap, ForwardedMessage };
export { ServerMessage };