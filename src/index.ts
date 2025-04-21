import { Game } from './game';


const IMAGES = {
    playerImage: '/assets/player.png',
    tileIce: '/assets/tileIce.png'
};

const CONTROLS = {
    JUMP: " ", // SPACEBAR
    LEFT: "a",
    RIGHT: "d",
};

new Game("gameCanvas", IMAGES, CONTROLS);