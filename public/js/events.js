
var openRoute     =  document.getElementById('open-route')
var openVideo     =  document.getElementById('open-video')
var openConf      =  document.getElementById('open-conf')
var routeContainer  =  document.getElementById('route')
var videoContainer  =  document.getElementById('video')
var routeList       =  document.getElementById('route-list')
var confContainer   =  document.getElementById('conf')
var closeWindowRoute     =  document.getElementById('return-route')
var closeWindowVideo     =  document.getElementById('return-video')
var closeWindowConf     =  document.getElementById('close-conf')

openRoute.addEventListener('click',function(){
    routeContainer.style.zIndex = 100
    routeContainer.style.left = 0
})

openVideo.addEventListener('click',function(){
    videoContainer.style.left = 0
    videoContainer.style.zIndex = 100
})

closeWindowRoute.addEventListener('click', function(){
    routeContainer.removeAttribute('style')
})

closeWindowVideo.addEventListener('click', function(){
    videoContainer.removeAttribute('style')
})

closeWindowConf.addEventListener('click', function(){
    confContainer.removeAttribute('style')
    openConf.removeAttribute('style')
})

openConf.addEventListener('click', function(){
    confContainer.style.left = 75 + 'vw'
    confContainer.style.zIndex = 100
    openConf.style.display = 'none'
})

var iGree = document.getElementById('ok')

function ok(){
    for(var i = 1; i < rowAction +1; i++){
        var number = document.getElementById('number-' + i).value
        numbersAutonomy.push(number)
        var action = document.getElementById('action-' + i).value
        actionsAutonomy.push(action)
    }
    routeContainer.style.left = 100 + 'vw'
    socket.emit('autonomy',autonomy)
}

var rec = document.getElementById('rec')
var recOn = false
var counterRec = 0
var alerts = document.getElementById('alerts')

rec.addEventListener('mouseover', function(){
    if(recOn == false){
        document.getElementById('image-rec').src = 'image/rec-over.png'
    }
})

rec.addEventListener('mouseout', function(){
    if(recOn == false){
        document.getElementById('image-rec').src = 'image/rec-off.png'
    }
})

rec.addEventListener('click', function(){
    counterRec ++
    if(counterRec == 1){
        recOn = true
        document.getElementById('image-rec').src = 'image/rec-on.png'
    } else {
        console.log('recOn')
        recOn = false
        counterRec = 0
        document.getElementById('image-rec').src = 'image/rec-off.png'
        alerts.setAttribute('style', 'left: 35vw; z-index: 106')
        saveVideo()
    }
    socket.emit('rec',recOn)
})

$('#alerts').on('click', 'div', function(){
    if(this.id == 'save'){
        alerts.innerHTML = "Generando video, por favor espere..."
        socket.emit('event',86)
    } else if(this.id == 'no-save'){
        alerts.innerHTML = ""
        alerts.removeAttribute('style')
    } else if(this.id == 'acept'){
        alerts.innerHTML = ""
        alerts.removeAttribute('style')
    }
})

socket.on('videostate', function(msg){

    if(msg == true){
        var acept = document.createElement('div')
        acept.id = "acept"
        acept.className = "button-alert"
        acept.innerHTML = "Ok"
        alerts.innerHTML = "El video fue guardado con exito."
        alerts.appendChild(acept)
    }
});

function saveVideo(){
    var buttonYes = document.createElement('div')
        buttonYes.id = 'save'
        buttonYes.className = 'button-alert'
        buttonYes.innerHTML = "Si"
    var buttonNo = document.createElement('div')
        buttonNo.id = 'no-save'
        buttonNo.className = 'button-alert'
        buttonNo.innerHTML = "No"

    alerts.innerHTML = "¿Quieres guardar el video?  Esto puede tardar unos minutos"
    alerts.appendChild(buttonYes)
    alerts.appendChild(buttonNo)
}

var controlHelp = document.getElementById('control-help-panel')

$('#controls-help').click(function(){
    controlHelp.style.left = 0
})

$('#close-help').click(function(){
    controlHelp.style.left = -385 + 'px'
})

function switchButton(element){
    if(element.className == 'switch-on'){
        element.className = "switch-off"
        element.parentElement.className = "switch bg-off"
    }
    else{
        element.className = "switch-on"
        element.parentElement.className = "switch"
    }
}

$('#emergensy-disable').click(function(){
    switchButton(this)
    if(this.className == 'switch-on'){
        socket.emit('configuration',['usbRecors', true])
    }
    else {
        this.className = "switch-off"
        socket.emit('configuration',['usbRecors', false])
    }
})

$('#takeoff-stablish').click(function(){
    switchButton(this)
    if(this.className == 'switch-on'){
        socket.emit('configuration',['fe', true])
    }
    else {
        this.className = "switch-off"
        socket.emit('configuration',['fe', false])
    }
})

$('#altitude-max').change(function(){
    var altitudeM = this.value
    socket.emit('configuration',['altitude-max', altitudeM])
})

$('#takeoff-stablish').change(function(){
    switchButton(this)
    if(this.className == 'switch-on'){
        socket.emit('configuration',['detec-type', 12])
    }
    else {
        this.className = "switch-off"
        socket.emit('configuration',['detec-type', 0])
    }
})

var deleteVideo = false
var backupVideo = false

$('#delete-video').click(function(){
    deleteVideo = true
})

$('#video-list').on('click', 'video', function(){
    var video = this.src.replace('http://localhost:3000/videos/', '')
    if(deleteVideo == true){
        socket.emit('delete-video',video)
        deleteVideo = false
        videoList.innerHTML = " "
    }
})

$('#backup-video').click(function(){
    backupVideo = true
})

$('#video-list').on('click', 'video', function(){
    var video = this.src.replace('http://localhost:3000/videos/', '')
    if(backupVideo == true){
        socket.emit('backup-video',video)
        deleteVideo = false
    }
})






/*var map = document.getElementById('map')
var ctxMap = map.getContext('2d')
ctxMap.translate(300, 200)
$('#route-action').on('change', 'select', function(){
    var draw = this.value
    var id = this.id.replace('action', 'number')
    var value = document.getElementById(id).value

    switch(draw){
        case "forward":
            ctxMap.moveTo(0,0)
            ctxMap.lineTo(0,value * 10)
            ctxMap.lineWidth = 3
            ctxMap.strokeStyle = "#10e0d8"
            ctxMap.stroke()
        break
    }
})*/


