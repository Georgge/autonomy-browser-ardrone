'use strict'
var express =  require('express')
var app     =  express()
var http    =  require('http').Server(app)
var io      = require('socket.io')(http)

var arDrone  = require('ar-drone')
var cheasser          =  arDrone.createClient()
var arDroneConstants    =   require('./node_modules/ar-drone/lib/constants')

//Static router
app.use(express.static(__dirname + '/public'))

var walk    = require('walk');
//leer de un directorio



//Dependences to autonomy and manual fly

function navdata_option_mask(c) {
  return 1 << c;
}
// From the SDK.
var navdata_options = (
    navdata_option_mask(arDroneConstants.options.DEMO)
  | navdata_option_mask(arDroneConstants.options.VISION_DETECT)
  | navdata_option_mask(arDroneConstants.options.MAGNETO)
  | navdata_option_mask(arDroneConstants.options.WIFI)
);

//Initial configuration for ArDrone
cheasser.config('general:navdata_demo', false)
cheasser.config('general:navdata_options', navdata_options)
cheasser.config('video:video_channel', 1)
cheasser.config('detect:detect_type', 12)
cheasser.config('control:altitude_max', 1500)
//cheasser.config('network:ssid_single_player', 'UTTE-MMSS')
//cheasser.config('network:wifi_mode', 2)


//Require messages and functions for fly
var control     = require('./Fly/Fly.js')
var video       = require('./Video/Video.js')
var messages    = require('./messages')

//Export functions to the server
var counter = 0;
var action = []
var number = []

//Streaming class

var fsS      = require('fs')
var path    = require('path')
var os      = require('os')
var tmpDir  = os.tmpDir()

var output
var pngStream
var lastPng
var counter
var tmpDir = os.tmpDir()
var recOn = false
var flag

class Streaming {

    constructor(){
        counter = 0
        console.log("Generating streaming")
    }

    getStream(cheasser){
        pngStream = cheasser.getPngStream()
        pngStream
        .on('error', console.log)
        .on('data', function(pngBuffer) {
            lastPng = pngBuffer
            if(recOn == true){
                getVideo.generateImages(lastPng)
            }
            flag = true
        })
    }

    generateImages(bufferImage){
        counter ++
        output = fsS.createWriteStream(path.join(tmpDir,'img' + counter + '.png'))
        output.write(bufferImage)
    }
}

var getVideo = new Streaming()
getVideo.getStream(cheasser)
//require("dronestream").listen(http);

var altitude,   velocity,   battery,    wifi,   gpsState,   gpsSatellite,
    windSpeed,  windAngle,  motorProblem,   usbReady, emergencyLanding, flyState, speedDrone


io.on('connection', function(socket){
    var files   = [];
    // Walker options
    var walker  = walk.walk('./public/videos', { followLinks: false });

    walker.on('file', function(root, stat, next) {
        // Add this file to the list of files
        files.push(stat.name);
        next();
    });

    walker.on('end', function() {
        //console.log(files);
        socket.emit('files', files)
    });
    setInterval(function(){
        if(flag == true){
            socket.emit('frame', { image: true, buffer: lastPng.toString('base64') , binary: true}) //send video
        }
    }, 100)


    //Socket to send drone data (altitude, velocity, etc)
    cheasser.on('navdata', function(data) {
        socket.emit('general-data', {altitude: altitude, velocity: velocity, battery: battery, wifi: wifi, gpsState: gpsState, gpsSat: gpsSatellite, windSpeed: windSpeed, windAngle: windAngle, motor: motorProblem, usb: usbReady, el: emergencyLanding, fly: flyState})
        socket.emit('drone-ubication', {lat: currentLat, lon: currentLon, yaw: currentYaw,    distance: currentDistance, speed: speedDrone})
        socket.emit('drone', {lat: currentLat, lon: currentLon, yaw: currentYaw,    distance: currentDistance, speed: speedDrone})
    })



      socket.on('control', function(ev) {
        console.log('[control]', JSON.stringify(ev));
        if(ev.action == 'animate'){
          cheasser.animate(ev.animation, ev.duration)
        } else {
          cheasser[ev.action].call(cheasser, ev.speed);
        }
      })

    socket.on('event', function(event){
        if(event == 82){
            io.emit('autonomy', 'next');
        } else if(event == 86) {
            video(socket)
        } else if(event == 78) {
            var execute = require('./mission/index.js')(parrot)
        } else if(event == 'rec'){
            recOn = event
        } else if(event == 'droneStream'){
            console.log('dronestream')
            pngStream
        } else {
            control(cheasser, event)
            console.log(event)
        }

        io.emit('message', '#Hibou:~ ' + messages[event]);
    });

    socket.on('rec', function(state){
        recOn = state
    });

    //Socket to stop drone
    socket.on('stop', function(event){
        cheasser.stop();
        io.emit('message', '#Hibou:~ Stop');
    });

    socket.on('configuration', function(event){
        console.log(event[0])
        console.log(event[1])
        if(event[0] == 'usbRecord')
            cheasser.config('video:video_on_usb ', event[1])
        if(event[0] == 'altitude-max')
            cheasser.config('control:altitude_max', event[1] * 1000)
        if(event[0] == 'detec-type')
            cheasser.config('detect:detect_type', event[1])
    });

    //GPS section
    socket.on('reset', function(data){
        console.log('reset', data)
        cheasser.disableEmergency()
    })

    socket.on('go', function(data){
        console.log(data)
        targetLat = data.lat
        targetLon = data.lon
    })

    socket.on('stopMap', function(data){
        stop()
    })

     socket.on('delete-video', function(data){
        var fileToDelete = './public/videos/' + data
        fsS.unlinkSync(fileToDelete)
        files  = []
        var walker  = walk.walk('./public/videos', { followLinks: false });
        walker.on('file', function(root, stat, next) {
            // Add this file to the list of files
            files.push(stat.name);
            next();
        });

        walker.on('end', function() {
            console.log(files);
            socket.emit('files', files)
        });
    })


    socket.on('backup-video', function(data){
        console.log("vidiio")
        console.log(data)
        var fileToBackup = './public/videos/' + data
        var SaveFileOn = './public/videobackup/' + data

        fsS.createReadStream(fileToBackup).pipe(fsS.createWriteStream(SaveFileOn))

    })

    socket.on('go-start', function(data){
        var intervalStop
        var timeOutUp
        console.log('gostart')
        cheasser.takeoff()

        var timeOutUp = setTimeout(function(){
            cheasser.up(data.altitude)
            clearTimeout(timeOutUp)
            //console.log('subiendo')
        }, 5000)

        intervalStop = setInterval(function(){
            console.log()
            if(altitude > 1.8){
                cheasser.stop()
                //console.log('stop')
                targetLat = data.lat
                targetLon = data.lon
                clearInterval(intervalStop)
            }
        },100)

    })
})

/*GPS Section elements and functions*/


var PID      = require('./PID');
var vincenty = require('node-vincenty');
var yawPID = new PID(1.0, 0, 0.30);

var targetLat,          targetLon,          targetYaw,
    cyaw,               currentLat,         currentLon,
    currentDistance,    currentYaw,         phoneAccuracy


var stop = function(){
    //console.log('stop', data)
    targetYaw = null
    targetLat = null
    targetLon = null
    cheasser.stop()
}

var handleNavData = function(data){
    //console.log(data)
    if(data.demo){
        altitude = data.demo.altitudeMeters
        velocity = data.demo.velocity
        battery = data.demo.batteryPercentage
        wifi = data.wifi
        flyState = data.demo.flyState
    }

    if(data.gps){
        gpsState = data.gps.gpsState
        gpsSatellite =  data.gps.nbSatellites
        speedDrone = data.gps.speed
    }

    if(data.windSpeed){
        windSpeed = data.windSpeed.speed
        windAngle =  data.windSpeed.angle
    }

    if(data.droneState){
        motorProblem = data.droneState.motorProblem
        usbReady = data.droneState.usbReady
        emergencyLanding = data.droneState.userEmergencyLanding
    }

  if ( data.demo == null || data.gps == null) {
      //console.log('demo or gps null')
      return
  }
  currentLat = data.gps.latitude
  currentLon = data.gps.longitude

  currentYaw = data.demo.rotation.yaw;
//console.log(data.gps)
  if (targetLat == null || targetLon == null || currentYaw ==  null || currentLat == null || currentLon == null) {
      //console.log("broken")
      return
  }

  var bearing = vincenty.distVincenty(currentLat, currentLon, targetLat, targetLon)
  console.log(bearing.distance)

  if(bearing.distance > 1){
    //console.log('goRoute')
    currentDistance = bearing.distance
    console.log('distance', bearing.distance)
    console.log('bearing:', bearing.initialBearing)
    targetYaw = bearing.initialBearing

    console.log('currentYaw:', currentYaw);
    var eyaw = targetYaw - currentYaw;
    console.log('eyaw:', eyaw);

    var uyaw = yawPID.getCommand(eyaw);
    console.log('uyaw:', uyaw);

    var cyaw = within(uyaw, -1, 1);
    console.log('cyaw:', cyaw);

    cheasser.clockwise(cyaw)
    cheasser.front(0.01)
  } else {
    targetYaw = null
    io.sockets.emit('waypointReached', {lat: targetLat, lon: targetLon})
    console.log('Reached ', targetLat, targetLon)
    stop()
  }
}

cheasser.on('navdata', handleNavData);

function within(x, min, max) {
  if (x < min) {
      return min;
  } else if (x > max) {
      return max;
  } else {
      return x;
  }
}



//If server it's ready print port
http.listen(3000, function(res){
    console.log("listen port 3000");
});
