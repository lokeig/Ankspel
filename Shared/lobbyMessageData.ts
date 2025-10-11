type LobbyMessageData = {
    host: string,
    lobbyID: string,
    lobbyName: string,
    playerCount: number,
    maxPlayers: number,
    closed: boolean
};

export type { LobbyMessageData };