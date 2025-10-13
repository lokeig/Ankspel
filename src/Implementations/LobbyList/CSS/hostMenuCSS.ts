import { GameServer } from "@server";
import { ClientMessage, CMsgType } from "@shared";

class HostMenu {
    private hostmenu: HTMLElement;

    private cancelbutton: HTMLButtonElement;
    private createbutton: HTMLButtonElement;

    private nameInput: HTMLInputElement;
    private maxPlayersInput: HTMLInputElement;

    constructor() {
        this.hostmenu = document.getElementById("hostMenu")!;

        this.cancelbutton = document.getElementById("cancelHostbutton") as HTMLButtonElement;
        this.createbutton = document.getElementById("createLobbybutton") as HTMLButtonElement;
        
        this.nameInput = document.getElementById("lobbyNameInput") as HTMLInputElement;
        this.maxPlayersInput = document.getElementById("maxPlayersInput") as HTMLInputElement;

        this.createbutton.disabled = true;
        this.nameInput.addEventListener("input", () => this.validateInputs());
        this.maxPlayersInput.addEventListener("input", () => this.validateInputs());

        this.cancelbutton.addEventListener("click", () => {
            this.hide();
            this.nameInput.value = "";
            this.maxPlayersInput.value = "4";
        });

        this.createbutton.addEventListener("click", () => {
            const lobbyName = this.nameInput.value.trim();
            const maxPlayers = parseInt(this.maxPlayersInput.value);

            console.log("Creating lobby:", lobbyName, maxPlayers);
            this.hide();    

            const hostLobbyMsg: ClientMessage = { 
                type: CMsgType.hostLobby, 
                lobbySize: maxPlayers, 
                lobbyName: this.nameInput.value 
            };
            GameServer.get().sendToServer(hostLobbyMsg);

            this.nameInput.value = "";
            this.maxPlayersInput.value = "4";
        });
    }

    private validateInputs(): void {
        const lobbyName = this.nameInput.value.trim();
        const maxPlayers = parseInt(this.maxPlayersInput.value);

        const isValid = this.isValidLobbyName(lobbyName) && this.isValidMaxPlayers(maxPlayers);
        this.createbutton.disabled = !isValid;
    }

    private isValidLobbyName(name: string): boolean {
        return name.length >= 3 && name.length <= 20;
    }

    private isValidMaxPlayers(value: number): boolean {
        return !isNaN(value) && value >= 2 && value <= 16;
    }


    public hide(): void {
        this.hostmenu.classList.add("hidden");
    }

    public show(): void {
        this.hostmenu.classList.remove("hidden");
    }

}

export { HostMenu };