export type Vector = {
    x: number,
    y: number
}

export type Controls = {
    left: string,
    right: string,
    jump: string,
    down: string,
    up: string,

    shoot: string,
    pickup: string,    
}

export type Neighbours = {
    left: boolean,
    right: boolean,
    top: boolean,
    bot: boolean,
    topLeft: boolean,
    topRight: boolean,
    botLeft: boolean,
    botRight: boolean
}

export type Direction = keyof Neighbours;

export function getReverseDirection(direction: Direction) {
    switch (direction) {
        case "left"    : return "right";
        case "right"   : return "left";
        case "top"     : return "bot";
        case "bot"     : return "top";
        case "topLeft" : return "botRight";
        case "topRight": return "botLeft";
        case "botLeft" : return "topRight";
        case "botRight": return "topLeft";
    }
}

export enum PlayerState {
    Standing,
    Flying,
    Slide,
    Crouch,
    Flap
}



export enum SwordState {
    Parrying,
    Thrusting
}

export enum WeaponState {
    Loaded,
    Empty
}
