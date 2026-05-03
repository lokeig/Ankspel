import { Controls, Input } from "@common";
import { Connection } from "@game/Server";
import { Render } from "@render";
import { GameLoop } from "@game/GameLoop";
import { MainMenuCSS, MapEditorMenuCSS } from "@impl/Menus/CSS";
import { CanvasRender } from "@impl/Render";
import { MultiPeerServer } from "@impl/Server/WebRTC";
import { RequestAnimationFrameTimer } from "@impl/FrameTimer/requestAnimationFrame";
import { HTMLAudio } from "@impl/Audio/HTMLAudio";
import { AudioManager } from "@game/Audio/audioManager";
import { registerDefaultNames } from "@impl/register";
import { MainMenu, MapEditorMenu } from "@menu";
import { MapEditor } from "@game/MapEditor/mapEditor";
import { ControlsMenu } from "@impl/Menus/CSS/controlsMenu";
import { resizeCanvas } from "@impl/Menus/CSS/resizeCanvas";

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

new MapEditor(controls, new RequestAnimationFrameTimer()).init();


