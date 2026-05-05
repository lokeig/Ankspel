class LobbySettingsMenu {
    private lobbySettings: HTMLElement;

    private cancelButton: HTMLButtonElement;
    private saveButton: HTMLButtonElement;
    private resetButton: HTMLButtonElement;

    constructor() {
        this.lobbySettings = document.getElementById("lobbySettings")!;

        this.cancelButton = document.getElementById("cancelLobbyButton") as HTMLButtonElement;
        this.saveButton = document.getElementById("saveLobbyButton") as HTMLButtonElement;
        this.resetButton = document.getElementById("resetLobbyButton") as HTMLButtonElement;

        this.cancelButton.addEventListener("click", () => {
            this.hide();
        });
        this.saveButton.addEventListener("click", () => this.save());
        this.resetButton.addEventListener("click", () => this.reset())
    }

    private reset(): void {

    }

    private save(): void {
        this.hide();
    }

    public show(): void {
        this.lobbySettings.classList.remove("hidden");
    }

    public hide(): void {
        this.lobbySettings.classList.add("hidden");
    }
}

export { LobbySettingsMenu };