import { Input } from "@common";
import { Connection } from "@game/Server";
import { Render } from "@render";
import { GameLoop } from "@game/GameLoop";
import { MainMenuCSS, ScoreBoardCSS, TrophyBoardCSS } from "@impl/Menus/CSS";
import { CanvasRender } from "@impl/Render";
import { MultiPeerServer } from "@impl/Server/WebRTC";
import { MapManager } from "@game/Map";
import { defaultMap } from "@impl/Maps";
import { RequestAnimationFrameTimer } from "@impl/FrameTimer/requestAnimationFrame";
import { HTMLAudio } from "@impl/Audio/HTMLAudio";
import { AudioManager } from "@game/Audio/audioManager";
import { registerDefaultNames } from "@impl/register";
import { MainMenu, ScoreBoard } from "@menu";
import { resizeCanvas } from "@impl/Menus/CSS/resizeCanvas";

Input.init(document.getElementById("gameCanvas")!);
Render.set(new CanvasRender("gameCanvas"));
AudioManager.set(new HTMLAudio());
MapManager.addMap(defaultMap);
registerDefaultNames();

Connection.set(new MultiPeerServer(new WebSocket("https://ankspel.onrender.com")));
MainMenu.set(new MainMenuCSS());
ScoreBoard.setScore(new ScoreBoardCSS());
ScoreBoard.setWins(new TrophyBoardCSS());

resizeCanvas("gameCanvas");

new GameLoop(new RequestAnimationFrameTimer()).init();