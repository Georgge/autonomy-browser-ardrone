/*new NodecopterStream(document.getElementById("droneStream"));*/

var keys   = {};


$(document).keydown(function(event){
    keys[event.which] = true;

    if(String.fromCharCode(event.keyCode) == 'N'){
        socket.emit('event',event.keyCode);
    } else if (event.keyCode == 38 || event.keyCode == 40 || event.keyCode == 37 || event.keyCode == 39 ||
               event.keyCode == 87 || event.keyCode == 83 || event.keyCode == 65 || event.keyCode == 68 ||
               event.keyCode == 70 || event.keyCode == 76 || event.keyCode == 80 || event.keyCode == 13 ||
               event.keyCode == 67 || event.keyCode == 82 || event.keyCode == 66 || event.keyCode == 86 ||
               event.keyCode == 75){
        socket.emit('event',event.keyCode);
    }

    if(event.keyCode == 38) {
        document.getElementById('rigth-up').className = "keypress-rigth";
    }
    if(event.keyCode == 40) {
        document.getElementById('rigth-down').className = "keypress-rigth";
    }
    if(event.keyCode == 37) {
        document.getElementById('rigth-left').className = "keypress-rigth";
    }
    if(event.keyCode == 39) {
        document.getElementById('rigth-rigth').className = "keypress-rigth";
    }

    if(event.keyCode == 87) {
        document.getElementById('left-up').className = "keypress-left";
    }
    if(event.keyCode == 83) {
        document.getElementById('left-down').className = "keypress-left";
    }
    if(event.keyCode == 65) {
        document.getElementById('left-left').className = "keypress-left";
    }
    if(event.keyCode == 68) {
        document.getElementById('left-rigth').className = "keypress-left";
    }
});

$(document).keyup(function(event){
    delete keys[event.which];
    if(event != 78){
        socket.emit('stop','stop');
    }

    document.getElementById('rigth-up').className = "control-button";
    document.getElementById('rigth-down').className = "control-button";
    document.getElementById('rigth-left').className = "control-button";
    document.getElementById('rigth-rigth').className = "control-button";

    document.getElementById('left-up').className = "control-button";
    document.getElementById('left-down').className = "control-button";
    document.getElementById('left-left').className = "control-button";
    document.getElementById('left-rigth').className = "control-button";
});

var socket = io();

socket.on('message', function(msg){
    $('#messages').html(msg);
});





var battery = document.getElementById('battery');
var altitudeBar = document.getElementById('altitude-bar')
var altitudeFour
var x, y, z

socket.on('general-data', function(msg){
    $('#altitude').html(msg.altitude + 'm')
    altitudeFour = msg.altitude + 3
    altitudeBar.setAttribute('style', 'height: ' + altitudeFour + 'px')

    x = msg.velocity.x
    y = msg.velocity.y
    z = msg.velocity.z
    $('#velocity').html(x.toFixed(3) + ' / ' + y.toFixed(3) + ' / ' + z.toFixed(3))

    if(msg.battery <= 40){
        battery.className = 'batteryOrange';
    }
    if(msg.battery <= 15){
        battery.className = 'batteryRed';
    }
    $('#bat').html(msg.battery)

    $('#wifi').html(msg.wifi.linkQuality)

    if(msg.gpsState != 0){
        $('#gpsPlug').html("Si")
        $('#gpsSatellite').html(msg.gpsSat)
    }

    else{
        $('#gpsPlug').html("No")
        $('#gpsSatellite').html('No disponible')
    }

    if(msg.windSpeed == undefined || msg.windAngle == null){
        $('#windSpeed').html('No disponible')}
    else{
        $('#windSpeed').html(msg.windSpeed.toFixed(8) + 'km/h')}
    if(msg.windAngle == undefined || msg.windAngle == null){
        $('#windAngle').html('No disponible')}
    else{
        $('#windAngle').html(msg.windAngle.toFixed(8) + '°')
    }

    $('#motorProblem').html(msg.motor)

    if(msg.usb == 1){
        $('#usb-ready').html("Si")}
    else{
        $('#usb-ready').html("No")}

    $('#emergency-landing').html(msg.el)
    $('#fly-state').html(msg.fly)

})


socket.on('drone-ubication', function(msg){
    $('#drone-latitude').html(msg.lat)
    $('#drone-longitude').html(msg.lon)
    $('#drone-speed').html(msg.speed.toFixed(3) + ' m/s')
})

var videoList = document.getElementById('video-list')
socket.on('files', function(msg){
    videoList.innerHTML = " "
    for(var i = 0; i < msg.length; i ++){
        var video = document.createElement('video')
        video.src = 'videos/' + msg[i]
        video.setAttribute('controls', 'true')
        videoList.appendChild(video)
    }
})






var numbersAutonomy = []

var actionsAutonomy = []

var autonomy = [
    numbersAutonomy,
    actionsAutonomy
]

var count = 0;

//draw imagevar
var canvas = document.getElementById('image-drone')
canvas.width = 640
canvas.height = 360
var ctx = canvas.getContext('2d')

var img = new Image()

socket.on('frame', function(buffer){
    img.src = 'data:image/png;base64,' + buffer.buffer;
    ctx.drawImage(img, 0, 0)
});

$('#takeoff').click(function(){
    socket.emit('event',80)
})

$('#land').click(function(){
    socket.emit('event',13)
})

$('#takeoffMap').click(function(){
    socket.emit('event',80)
})

$('#landMap').click(function(){
    socket.emit('event',13)
})

$('#calibrate').click(function(){
    socket.emit('event',67)
})

$('#flash-light').click(function(){
    socket.emit('event',76)
})

var flagCamera = 0

$('#switch-camera').click(function(){
    if(flagCamera == 0){
        socket.emit('event',70)
        flagCamera = 1
    }else{
        socket.emit('event',66)
        flagCamera = 0
    }
})



