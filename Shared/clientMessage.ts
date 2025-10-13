enum CMsgType {
    forward = "forward",
    connect = "connect",
    joinLobby = "joinLobby",
    leaveLobby = "leaveLobby",
    hostLobby = "hostLobby",
    startLobby = "startLobby",
    listLobbies = "listLobbies",
    listUsers = "listUsers",
}

type ForwardMessage<T = unknown> = {
    type: CMsgType.forward;
    to: string;
    msg: T;
};

type ClientMessage =
    | ForwardMessage
    | { type: CMsgType.connect }
    | { type: CMsgType.joinLobby; lobbyID: string }
    | { type: CMsgType.leaveLobby }
    | { type: CMsgType.hostLobby; lobbyName: string; lobbySize: number }
    | { type: CMsgType.startLobby }
    | { type: CMsgType.listLobbies }
    | { type: CMsgType.listUsers };

export type { ClientMessage, ForwardMessage };
export { CMsgType };