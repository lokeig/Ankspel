import { IScoreBoard } from "@menu";

class TrophyBoardCSS implements IScoreBoard {
    private mainDiv: HTMLElement;
    private scores: HTMLElement;

    constructor() {
        this.mainDiv = document.getElementById("trophyBoard") as HTMLElement;
        this.scores = document.getElementById("wins") as HTMLElement;
    }

    public show(): void {
        this.mainDiv.style.display = "flex";
    }

    public hide(): void {
        this.mainDiv.style.display = "none";
    }

    private hexToRGB(hex: string): string {
        let R = Number("0x" + hex.substring(1, 3));
        let G = Number("0x" + hex.substring(3, 5));
        let B = Number("0x" + hex.substring(5, 7));

        return `${R}, ${G}, ${B}`;
    }

    public refresh(scores: { name: string; score: number; color: string }[]): void {
        this.scores.innerHTML = "";
        for (const score of scores) {
            const item: HTMLDivElement = document.createElement("div");
            item.className = "playerScore";
            item.innerHTML = `<span class="name">${score.name}</span>`;

            const row = document.createElement("div");
            row.className = "trophyRow";

            for (let i = 0; i < score.score; i++) {
                const img = document.createElement("img");
                img.src = "/assets/Images/Items/trophy.png";
                img.className = "trophyIcon";
                row.appendChild(img);
            }
            item.appendChild(row);
            
            const rgb = this.hexToRGB(score.color);
            item.style.setProperty("--player-color-rgb", rgb);
            this.scores.appendChild(item);
        }
    }

    public setOpacity(opac: number): void {
        this.mainDiv.style.opacity = opac.toString();
    }
}

export { TrophyBoardCSS };