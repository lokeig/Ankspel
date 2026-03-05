import { Controls, Utility } from "@common";

class ControlsMenu {
    private controlsMenu: HTMLElement;

    private cancelButton: HTMLButtonElement;
    private saveButton: HTMLButtonElement;
    private activeInput: HTMLInputElement | null = null;
    private keyHandler: ((e: KeyboardEvent) => void) | null = null;

    private currentControls: Controls = this.loadControls();

    private backupControls: Controls = { ...this.currentControls };
    private controlInputs: Record<keyof Controls, HTMLInputElement>;


    constructor() {
        this.controlsMenu = document.getElementById('controlsMenu')!;

        this.cancelButton = document.getElementById('cancelControlsButton') as HTMLButtonElement;
        this.saveButton = document.getElementById('saveControlsButton') as HTMLButtonElement;

        this.controlInputs = {
            jump: document.getElementById('jumpInput') as HTMLInputElement,
            left: document.getElementById('leftInput') as HTMLInputElement,
            right: document.getElementById('rightInput') as HTMLInputElement,
            down: document.getElementById('downInput') as HTMLInputElement,
            up: document.getElementById('upInput') as HTMLInputElement,
            shoot: document.getElementById('shootInput') as HTMLInputElement,
            pickup: document.getElementById('pickupInput') as HTMLInputElement,
            ragdoll: document.getElementById('ragdollInput') as HTMLInputElement,
            strafe: document.getElementById('strafeInput') as HTMLInputElement,
            menu: document.getElementById('menuInput') as HTMLInputElement
        };

        this.cancelButton.addEventListener("click", () => {
            this.currentControls = { ...this.backupControls };
            this.hide();
        });
        this.saveButton.addEventListener('click', () => this.saveControls());

        for (const key in this.controlInputs) {
            const k = key as keyof Controls;
            const input = this.controlInputs[k];
            input.addEventListener("focus", () => this.startKeyCapture(input, k));
            input.addEventListener("click", () => this.startKeyCapture(input, k));
        }
    }

    private startKeyCapture(input: HTMLInputElement, control: keyof Controls) {
        if (this.keyHandler && this.activeInput) {
            window.removeEventListener("keydown", this.keyHandler);
        }
        this.activeInput = input;

        this.keyHandler = (e: KeyboardEvent) => {
            e.preventDefault();
            input.value = this.displayKey(e.key);
            this.currentControls[control] = e.key;

            window.removeEventListener("keydown", this.keyHandler!);
            this.activeInput = null;
            this.keyHandler = null;
        };

        window.addEventListener("keydown", this.keyHandler);
    }

    private displayKey(key: string): string {
        if (key === " ") {
            return "Space";
        }
        if (key.length === 1) {
            return key.toLowerCase();
        }
        return key;
    }

    private populateInputs(): void {
        for (const key in this.controlInputs) {
            const k = key as keyof Controls;
            this.controlInputs[k].value = this.currentControls[k] === " " ? "Space" : this.currentControls[k];
        }
    }

    private loadControls(): Controls {
        const saved = localStorage.getItem('gameControls');
        if (saved) {
            return JSON.parse(saved);
        } else {
            return {
                jump: " ",
                left: "a",
                right: "d",
                down: "s",
                up: "w",
                shoot: "ArrowLeft",
                pickup: "ArrowUp",
                ragdoll: "e",
                strafe: "Shift",
                menu: "Escape",
            };
        }
    }

    private saveControls(): void {
        for (const key in this.controlInputs) {
            let k = key.toLowerCase() as keyof Controls;
            const value = this.controlInputs[k].value === "Space" ? " " : this.controlInputs[k].value;
            if (value) {
                this.currentControls[k] = value;
            }
        }
        localStorage.setItem('gameControls', JSON.stringify(this.currentControls));
        this.hide();
    }

    public show(): void {
        this.backupControls = { ...this.currentControls };
        this.populateInputs();
        this.controlsMenu.classList.remove('hidden');
    }

    public hide(): void {
        this.controlsMenu.classList.add('hidden');
    }

    public getControls(player: number): Controls {
        return this.currentControls;
    }
}

export { ControlsMenu };