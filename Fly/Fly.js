'use strict'

/*
**Class for flaying drone
*/

class Fly {
    constructor(){
    }

    takeOff(client){
        client.takeoff()
    }

    land(client){
        client.land()
    }

    front(client){
        client.front(0.3)
    }

    back(client){
        client.back(0.3)
    }

    left(client){
        client.left(0.3)
    }

    right(client){
        client.right(0.3)
    }

    up(client){
        console.log('up')
        client.up(0.8)
    }

    down(client){
        client.down(0.3)
    }

    cwRight(client){
        client.clockwise(0.5)
    }

    cwLeft(client){
        client.clockwise(-0.5)
    }

    calibrate(client){
        client.calibrate(0)
    }

    getFrontCamera(client){
        client.config('video:video_channel', 0)
    }

    getBottomCamera(client){
        client.config('video:video_channel', 1)
    }

    madeDance(client){
        client.animate('yawDance', 5000)
    }

    leds(client){
        console.log('led')
        client.animateLeds('doubleMissile', 5, 5)
    }
}

const execute = new Fly()

var action = {
    80: 'takeOff',          // P
    13: 'land',             // Enter
    87: 'front',            // W
    83: 'back',             // S
    37: 'left',             // <-
    39: 'right',            // ->
    38: 'up',               // Arriba
    40: 'down',             // Abajo
    68: 'cwRight',          // D
    65: 'cwLeft',           // A
    67: 'calibrate',        // C
    76: 'leds',             // L
    70: 'getFrontCamera',   // F
    66: 'getBottomCamera',  // B
    75: 'madeDance'         // K
}

module.exports = function(client, event){
    execute[action[event]](client)
}
