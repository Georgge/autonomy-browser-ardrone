'use strict'

var mission = require('../mission/index')

class Route{

    constructor(){
        console.log("ReadRouter is load...")
    }

    readFileRoute(parrot){
        mission(parrot)
    }
}

var executeFly = new Route()

module.exports = function(parrot){
    executeFly.readFileRoute(parrot)
}
