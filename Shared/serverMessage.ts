import { LobbyMessageData } from "./lobbyMessageData";

enum SMsgType {
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
    type: SMsgType.forwarded;
    from: string;
    msg: T;
};

type ServerMessage =
    | ForwardedMessage
    | { type: SMsgType.connected, clientID: string }
    | { type: SMsgType.joinSuccess, lobbyID: string }
    | { type: SMsgType.leaveSuccess }
    | { type: SMsgType.hostSuccess; lobbyID: string; }
    | { type: SMsgType.newHost; hostID: string; }
    | { type: SMsgType.startGame; }
    | { type: SMsgType.lobbyList; lobbies: LobbyMessageData[]; }
    | { type: SMsgType.userList; users: string[]; }
    | { type: SMsgType.userJoined; userID: string; }
    | { type: SMsgType.userLeft; userID: string; }

export type { ServerMessage, ForwardedMessage };
export { SMsgType };