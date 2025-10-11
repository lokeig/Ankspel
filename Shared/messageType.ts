export enum MessageType {
    joinLobby,
    leaveLobby,
    hostLobby,
    startLobby,
    listLobbies,
    listUsers,
    connect,
    forward
}

export type forwardMessage = {
    type: MessageType.forward,
    msg: any
}