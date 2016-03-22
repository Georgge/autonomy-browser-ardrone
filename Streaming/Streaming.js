'use strict'
var fs      = require('fs')
var path    = require('path')
var os      = require('os')
var tmpDir  = os.tmpDir()

var output
var pngStream
var lastPng
var counter
var tmpDir = os.tmpDir()
var recOn = false
var flag = false

class Streaming {

    constructor(){
        counter = 0
        console.log("Generating streaming")
    }

    getStream(parrot, socket){
        pngStream = parrot.client().getPngStream()
        pngStream
        .on('error', console.log)
        .on('data', function(pngBuffer) {
            lastPng = pngBuffer
            socket.emit('frame', { image: true, buffer: lastPng.toString('base64') })
            if(recOn == true){
                getVideo.generateImages(lastPng)
            }
        })
        flag = true
    }

    generateImages(bufferImage){
        counter ++
        output = fs.createWriteStream(path.join(tmpDir,'img' + counter + '.png'))
        output.write(bufferImage)
    }
}

var getVideo = new Streaming()

module.exports = function (parrot, socket, rec){
    if(flag == false){
        getVideo.getStream(parrot, socket)
    }
    recOn = rec
}



