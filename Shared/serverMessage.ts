import { LobbyMessageData } from "./lobbyMessageData";

enum ServerMessage {
    Forwarded = "Forwarded",
    Connected = "Connected",
    JoinSuccess = "JoinSuccess",
    LeaveSuccess = "LeaveSuccess",
    HostSuccess = "HostSuccess",
    NewHost = "NewHost",
    StartGame = "StartGame",
    LobbyList = "LobbyList",
    UserList = "UserList",
    UserJoined = "UserJoined",
    UserLeft = "UserLeft",
}

type ForwardedMessage<T = unknown> = {
    from: string;
    msg: T;
};

interface ServerMessageMap {
    [ServerMessage.Forwarded]: { from: string, msg: ForwardedMessage };
    [ServerMessage.Connected]: { clientID: string };
    [ServerMessage.JoinSuccess]: { lobbyID: string };
    [ServerMessage.LeaveSuccess]: {};
    [ServerMessage.HostSuccess]: { lobbyID: string };
    [ServerMessage.NewHost]: { hostID: string };
    [ServerMessage.StartGame]: { userID: number };
    [ServerMessage.LobbyList]: { lobbies: LobbyMessageData[] };
    [ServerMessage.UserList]: { users: string[] };
    [ServerMessage.UserJoined]: { userID: string };
    [ServerMessage.UserLeft]: { userID: string };
}

export type { ServerMessageMap, ForwardedMessage };
export { ServerMessage };