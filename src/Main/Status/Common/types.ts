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

export enum PlayerState {
    Standing,
    Jump,
    Slide,
    Crouch,
    Flap,
    Ragdoll
}

export enum SwordState {
    Parrying,
    Thrusting
}

export enum WeaponState {
    Loaded,
    Empty
}

