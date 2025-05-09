import { Game } from './game';
import { Controls } from './types';


const IMAGES = {
    playerImage: '/assets/player.png',
    tileIce: '/assets/tileIce.png'
};

const controls: Controls = {
    jump: " ", // SPACEBAR
    left: "a",
    right: "d",
    down: "s"
};

new Game("gameCanvas", IMAGES, controls);