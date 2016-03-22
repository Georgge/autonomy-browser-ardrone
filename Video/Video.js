'use strict'

const ffmpeg  = require('fluent-ffmpeg')
const path    = require('path')
const os      = require('os')
const tmpDir  = os.tmpDir()
const uuid    = require('uuid')


class Video {
    constructor(){
        console.log("Genering video and save...")
    }

    generateVideo(socket){
        var baseName = uuid.v4()
        ffmpeg()
        .addInput(path.join(tmpDir, 'img%01d.png'))
        .outputOptions([
            '-r 24',
            '-filter:v setpts=2.8*PTS'
        ])
        .size('1280x720')
        .on('end', function(){
            socket.emit('videostate', true)
        })
        .on('error', function(err){
            console.error("Error al generar " + err.message)
        })
        .save('./public/videos/' + baseName + '.mp4')
    }
}

var saveVideo = new Video()

module.exports = function(socket){
    saveVideo.generateVideo(socket)
}
