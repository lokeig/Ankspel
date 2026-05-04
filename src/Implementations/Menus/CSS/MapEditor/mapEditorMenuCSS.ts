import { Frame, SelectionType } from "@common";
import { SpawnerDescription } from "@game/Map";
import { Vector } from "@math";
import { IMapEditorMenu } from "@menu";
import { MenuItems, MenuEntry, menuType, menuName, menuImage, menuFrame } from "./menuItems";
import { ImageInfo } from "@render";
import { getValidItemArray, spawnerSettingsContent, spawnerSettingsHeader } from "./spawnerSettings";

class MapEditorMenuCSS implements IMapEditorMenu {
    private menu: HTMLDivElement;
    private selectedItem: MenuEntry | null = null;

    private settings: HTMLDivElement;
    private buttonsDiv: HTMLDivElement;

    constructor() {
        this.menu = document.getElementById("mapEditorMenu") as HTMLDivElement;
        this.settings = document.getElementById("mapEditorSettings") as HTMLDivElement;

        this.buttonsDiv = document.getElementById("mapEditorButtons") as HTMLDivElement;
        this.buildMenu();
    }

    private buildMenu(): void {
        this.menu.innerHTML = "";

        for (const key in MenuItems) {
            const header = document.createElement("div");
            header.classList.add("menu-group-header");
            header.textContent = this.cleanupName(key);

            const content = document.createElement("div");
            content.classList.add("menu-group-content");

            MenuItems[key].forEach(item => {
                const itemDiv = this.createItemElement(item);
                content.appendChild(itemDiv);
            });

            this.menu.appendChild(header);
            this.menu.appendChild(content);
        }
    }

    private cleanupName(name: string): string {
        return name.replace(/([A-Z])/, " $1").replace(/^./, s => s.toUpperCase());
    }

    private createItemElement(item: MenuEntry): HTMLDivElement {
        const div = document.createElement("div");
        div.classList.add("menu-item");

        const wrapper = document.createElement("div");
        wrapper.classList.add("menu-icon-wrapper");

        const icon = document.createElement("div");
        icon.classList.add("menu-icon");

        const [name, image, frame] = item;

        const frameWidth = image.frameWidth;
        const frameHeight = image.frameHeight;
        const x = frame.col * frameWidth;
        const y = frame.row * frameHeight;

        icon.style.backgroundImage = `url(${image.src})`;
        icon.style.backgroundPosition = `-${x}px -${y}px`;
        icon.style.width = `${frameWidth}px`;
        icon.style.height = `${frameHeight}px`;

        const scale = 3;
        icon.style.transform = `scale(${scale})`;
        wrapper.appendChild(icon);

        const label = document.createElement("span");
        label.textContent = this.cleanupName(name);

        div.appendChild(wrapper);
        div.appendChild(label);

        div.onclick = () => this.selectItem(div, item);

        return div;
    }

    private selectItem(div: HTMLDivElement, item: MenuEntry): void {
        this.menu.querySelectorAll(".menu-item").forEach(element => {
            element.classList.remove("selected");
        });
        this.settings.innerHTML = "";
        if (item[menuType] === SelectionType.Spawner) {
            this.settings.appendChild(spawnerSettingsHeader);
            this.settings.appendChild(spawnerSettingsContent);
        }

        div.classList.add("selected");
        this.selectedItem = item;
    }

    public getSelection(): SelectionType {
        return this.selectedItem ? this.selectedItem[menuType] : SelectionType.None;
    }

    public getCurrentName(): string {
        return this.selectedItem![menuName];
    }

    public getParallaxIcon(): [ImageInfo, Frame, string] {
        return [this.selectedItem![menuImage], this.selectedItem![menuFrame], this.selectedItem![menuName]];
    }

    public getParallax(name: string): [ImageInfo, Frame] | null {
        const entry = MenuItems.parallaxes.find(e => e[menuName] === name);
        if (!entry) {
            return null;
        }
        return [entry[menuImage], entry[menuFrame]];
    }

    public getSpawner(pos: Vector): SpawnerDescription {
        const startSpawnedDiv = document.getElementById("startSpawned") as HTMLInputElement;
        const timeBetweenSpawnDiv = document.getElementById("timeBetweenSpawn") as HTMLInputElement;
        const containingDiv = document.getElementById("containing") as HTMLInputElement;

        return {
            pos,
            startSpawned: startSpawnedDiv.checked,
            timeBetweenSpawn: Number(timeBetweenSpawnDiv.value),
            possibleItems: getValidItemArray(containingDiv.value),
        };
    }

    public show(): void {
        this.menu.style.display = "flex";
        this.settings.style.display = "flex";
        this.buttonsDiv.style.display = "flex";
    }

    public hide(): void {
        this.menu.style.display = "none";
        this.settings.style.display = "none";
        this.buttonsDiv.style.display = "none";
    }
}

export { MapEditorMenuCSS };