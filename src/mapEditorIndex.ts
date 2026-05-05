import { Controls, Input } from "@common";
import { Connection } from "@game/Server";
import { Render } from "@render";
import { MapEditorMenuCSS } from "@impl/Menus/CSS";
import { CanvasRender } from "@impl/Render";
import { MultiPeerServer } from "@impl/Server/WebRTC";
import { RequestAnimationFrameTimer } from "@impl/FrameTimer/requestAnimationFrame";
import { HTMLAudio } from "@impl/Audio/HTMLAudio";
import { AudioManager } from "@game/Audio/audioManager";
import { registerDefaultNames } from "@impl/register";
import { MapEditorMenu } from "@menu";
import { ControlsMenu } from "@impl/Menus/CSS/controlsMenu";
import { resizeCanvas } from "@impl/Menus/CSS/resizeCanvas";
import { MapEditor } from "@game/MapEditor";
import { GameMap } from "@game/Map";

Input.init(document.getElementById("gameCanvas")!);
Render.set(new CanvasRender("gameCanvas"));
AudioManager.set(new HTMLAudio());
registerDefaultNames();

Connection.set(new MultiPeerServer(new WebSocket("https://ankspel.onrender.com")));
MapEditorMenu.set(new MapEditorMenuCSS());

const saved = localStorage.getItem('gameControls');
let controls: Controls;
if (saved) {
    controls = JSON.parse(saved);
} else {
    controls = { ...ControlsMenu.defaultControls };
}
resizeCanvas("gameCanvas");

const mapEditor = new MapEditor(controls, new RequestAnimationFrameTimer());
const saveButton = document.getElementById("saveButton") as HTMLButtonElement;
saveButton.addEventListener("click", async () => {
    const map = mapEditor.getMap();
    const json = JSON.stringify(map, null, 2);

    if ('showSaveFilePicker' in window) {
        const handle = await (window as any).showSaveFilePicker({
            suggestedName: "map.json",
            types: [
                {
                    accept: { "application/json": [".json"] }
                }
            ]
        });

        const writable = await handle.createWritable();
        await writable.write(json);
        await writable.close();
    } else {
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "map.json";
        a.click();

        URL.revokeObjectURL(url);
    }
});
const loadInput = document.getElementById("loadInput") as HTMLInputElement;
const loadButton = document.getElementById("loadButton") as HTMLButtonElement;

loadButton.addEventListener("click", () => {
    loadInput.click();
});
loadInput.addEventListener("change", () => {
    const file = loadInput.files?.[0];
    if (!file) {
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const jsonText = reader.result as string;
            const data = JSON.parse(jsonText);

            const map = GameMap.fromJson(data);
            mapEditor.load(map);

        } catch (err) {
            console.error("Failed to load map:", err);
        }
    };

    reader.readAsText(file);
});

mapEditor.init();