import { Connection, IMainMenu } from "@game/Server";
import { HostMenu } from "./hostMenuCSS";
import { ClientMessage, LobbyMessageData, CMsgType, ServerMessage } from "@shared";
import { ImageName } from "@render";
import { ControlsMenu } from "./controlsMenu";

class MainMenuCSS implements IMainMenu {
    private mainDiv: HTMLElement;
    private lobbyDiv: HTMLElement;
    private selectedLobbyId: string | null = null;
    private hostMenu = new HostMenu();
    private controlsMenu = new ControlsMenu;

    private joinbutton: HTMLButtonElement;
    private hostbutton: HTMLButtonElement;
    private startbutton: HTMLButtonElement;
    private leavebutton: HTMLButtonElement;
    private controlsButton: HTMLButtonElement; 

    private lastLobbies: LobbyMessageData[] = [];

    private connectedLobby: string | null = null;
    private hosting: boolean = false;

    constructor() {
        this.mainDiv = document.getElementById("gameServerList")!;
        this.lobbyDiv = document.getElementById("lobbylist")!;

        this.startbutton = document.getElementById("startbutton") as HTMLButtonElement;
        this.startbutton.addEventListener("click", () => this.onStart());

        this.leavebutton = document.getElementById("leavebutton") as HTMLButtonElement;
        this.leavebutton.addEventListener("click", () => this.onLeave());

        this.joinbutton = document.getElementById("joinbutton") as HTMLButtonElement;
        this.joinbutton.addEventListener("click", () => this.onJoin());

        this.hostbutton = document.getElementById("hostbutton") as HTMLButtonElement;
        this.hostbutton.addEventListener("click", () => this.onHost());

        this.controlsButton = document.getElementById("controlsButton") as HTMLButtonElement;
        this.controlsButton.addEventListener("click", () => this.onControls());

        this.startbutton.disabled = true;
        this.leavebutton.disabled = true;
        this.joinbutton.disabled = true;

        const lobbyEvent = Connection.get().serverEvent;

        lobbyEvent.subscribe(ServerMessage.LobbyList, ({ lobbies }) => {
            this.refresh(lobbies);
        });

        lobbyEvent.subscribe(ServerMessage.JoinSuccess, ({ lobbyID }) => {
            this.connectedLobby = lobbyID;
            this.leavebutton.disabled = false;
            this.refresh(this.lastLobbies);
        });

        lobbyEvent.subscribe(ServerMessage.LeaveSuccess, () => {
            this.connectedLobby = null;
            this.hosting = false;
            this.leavebutton.disabled = true;
            this.startbutton.disabled = true;
            this.hostbutton.disabled = false;
            this.connectedLobby = null;
            this.refresh(this.lastLobbies);
        });

        lobbyEvent.subscribe(ServerMessage.NewHost, ({ hostID }) => {
            if (hostID !== Connection.get().getID()) {
                return;
            }
            this.hosting = true;
            this.startbutton.disabled = false;
            this.refresh(this.lastLobbies);
        });

        lobbyEvent.subscribe(ServerMessage.HostSuccess, ({ lobbyID }) => {
            this.hosting = true;
            this.connectedLobby = lobbyID;
            this.leavebutton.disabled = false;
            this.startbutton.disabled = false;
            this.refresh(this.lastLobbies);
        });
    }

    private onControls(): void {
        this.controlsMenu.show();
    }

    public getChosenColor(): ImageName {
        const select = document.getElementById("playerColorSelect") as HTMLSelectElement;
        let color: string = "Yellow";
        if (select) {
            color = select.value;
        }
        return "player" + color as ImageName;
    }

    public show(): void {
        this.mainDiv.style.display = "flex";
    }

    public hide(): void {
        this.mainDiv.style.display = "none";
    }

    public refresh(lobbies: LobbyMessageData[]): void {
        this.lastLobbies = lobbies;

        let foundPreviousSelection: boolean = false;
        this.lobbyDiv.innerHTML = "";
        for (const lobby of lobbies) {

            const item: HTMLDivElement = document.createElement("div");
            item.className = "lobbylist-item";
            item.innerHTML = `
            <div class = "lobbylist-name lobbylist-column">${lobby.lobbyName}</div>
            <div class = "lobbylist-host lobbylist-column">${lobby.host}</div>
            <div class = "lobbylist-players lobbylist-column">${`${lobby.playerCount} / ${lobby.maxPlayers}`}</div>
            <div class = "lobbylist-status lobbylist-column">${this.getStatus(lobby)}</div>
            `
            item.dataset.lobbyID = lobby.lobbyID;
            if (lobby.lobbyID === this.selectedLobbyId) {
                this.selectItem(item);
                foundPreviousSelection = true;
            }
            item.addEventListener("click", () => {
                this.selectItem(item);
                this.selectedLobbyId = item.dataset.lobbyID!;
            });

            this.lobbyDiv.appendChild(item);
        }
        if (!foundPreviousSelection) {
            this.joinbutton.disabled = true;
            this.selectedLobbyId = null;
        }
    }

    private getStatus(lobby: LobbyMessageData): string {
        if (lobby.lobbyID === this.connectedLobby) {
            if (this.hosting) {
                return "Hosting"
            }
            return "Connected";
        }

        if (lobby.closed) {
            return "Closed";
        }

        if (lobby.playerCount === lobby.maxPlayers) {
            return "Full";
        }

        return "Open";
    }

    private clearSelection() {
        document.querySelectorAll(".lobbylist-item").forEach(item => item.classList.remove("selected"));
        this.selectedLobbyId = null;
        this.joinbutton.disabled = true;
    }

    private selectItem(item: HTMLDivElement) {
        this.clearSelection();
        item.classList.add("selected");
        this.joinbutton.disabled = false;
    }

    private onHost(): void {
        this.hostMenu.show();
        this.clearSelection();
    }

    private onLeave(): void {
        const leaveMsg: ClientMessage = {
            type: CMsgType.leaveLobby
        };
        Connection.get().sendClientMessage(leaveMsg);
    }

    private onJoin(): void {
        if (!this.selectedLobbyId) {
            return;
        }
        const joinMsg: ClientMessage = {
            type: CMsgType.joinLobby,
            lobbyID: this.selectedLobbyId
        };
        Connection.get().sendClientMessage(joinMsg);
        this.clearSelection();
    }

    private onStart(): void {
        const startMsg: ClientMessage = {
            type: CMsgType.startLobby,
        };
        Connection.get().sendClientMessage(startMsg);
    }
}

export { MainMenuCSS }