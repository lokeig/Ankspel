import { LobbyListInterface } from "../../../Game/GameLoop/States/Lobby/LobbyList/lobbylistInterface";
import { Lobby } from "../../../Game/GameLoop/States/Lobby/lobbyType";

export class LobbyListCSS implements LobbyListInterface {
    private div: HTMLElement
    private selectedLobbyId: string | null = null;

    constructor(divName: string) {
        this.div = document.getElementById(divName)!;
    }

    show(): void {
        this.div.style.display = "flex";
    }

    hide(): void {
        this.div.style.display = "none";

    }

    refresh(lobbies: Lobby[]): void {
        this.div.innerHTML = "";
        for (const lobby of lobbies) {

            const item: HTMLDivElement = document.createElement("div");
            item.className = "lobbylist-item";

            item.dataset.lobbyID = lobby.lobbyID;

            item.innerHTML = `
                <div class = "lobbylist-name lobbylist-column">${lobby.lobbyName}</div>
                <div class = "lobbylist-host lobbylist-column">${lobby.host}</div>
                <div class = "lobbylist-players lobbylist-column">${lobby.playerCount}</div>
                <div class = "lobbylist-status lobbylist-column">${lobby.status}</div>
            `

            item.addEventListener("click", () => {
                document.querySelectorAll(".lobbylist-item").forEach(item => item.classList.remove("selected"));
                item.classList.add("selected");
                this.selectedLobbyId = item.dataset.lobbyID!;
            });


            this.div.appendChild(item);
        }
    }


}