
var lat,        lon,
    map,        home,
    drone,      phone,
    phonePath,  waypointPath,
    dronePath,  startPosition

var targetLat, targetLon
var waypointMarkers = []
var activeWaypoints = []
var waypoints = []
var follow = false

var homeIcon = L.icon({
    iconUrl: 'js/maps/images/home.png'
});

var droneIcon = L.icon({
    iconUrl: 'js/maps/images/copter.png'
});

navigator.geolocation.getCurrentPosition(initMap, defaultMap, { enableHighAccuracy:true });

function initMap(position){
    lat = position.coords.latitude;
    lon = position.coords.longitude;

    map = L.map('map').setView([lat, lon],15);

    var mapType = "HYBRID"

    var googleLayer = new L.Google(mapType);
    map.addLayer(googleLayer);

    home = L.marker([lat, lon], {icon: homeIcon}).addTo(map)

    map.on('click', function(e) {
        waypointMarkers.push(L.marker(e.latlng).addTo(map))
        waypoints.push([e.latlng.lat, e.latlng.lng])
        if(waypointPath == undefined){
          waypointPath = L.polyline(waypoints, {color: '#00ff27'}).addTo(map);
        } else {
          waypointPath.setLatLngs(waypoints)
        }
      });
}

    var goLat = document.getElementById('goLat')
    var goLon = document.getElementById('goLon')

    function goMapPoint(goLatitude, goLongitude){
        map.panTo({lat: goLatitude, lng: goLongitude})
    }

    function defaultMap(err){
      console.log(err)
      initMap({coords: { latitude: 19.702798, longitude: -98.982950 }})
    }

    function clearWaypoints(){
      waypoints = []
      map.removeLayer(waypointPath)
      waypointPath = undefined
      $.each(waypointMarkers, function(i,m){map.removeLayer(m)})
    }

    function setCurrentTarget(lat, lon){
      targetLat = lat
      targetLon = lon
      console.log('go')
      socket.emit('go', {lat: targetLat, lon: targetLon})
    }

    function setCurrentTarget2(lat, lon){
        var altitude = document.getElementById('altitudeMap').val
        var sendAltitude
        if(altitude == null || altitude == 0) { sendAltitude = 2 }
        else { sendAltitude = altitude}

        targetLat = lat
        targetLon = lon

      socket.emit('go-start', {lat: targetLat, lon: targetLon, altitude: sendAltitude})
    }

    function clearCurrentTarget(){
      targetLat = undefined
      targetLon = undefined
      socket.emit('stopMap')
    }

     $(function(){
       $('#takeoff').click(function(){
         follow = false
         socket.emit('takeoff')
         if (drone != null){
           startPosition = [drone._latlng.lat, drone._latlng.lng]
         }
       })
       $('#reset').click(function(){
         socket.emit('reset')
       })
       $('#reset-main').click(function(){
         socket.emit('reset')
       })
       $('#stopMap').click(function(){
         follow = false
         clearCurrentTarget()
       })
       $('#stopMain').click(function(){
         follow = false
         clearCurrentTarget()
       })
       $('#clear').click(function(){
         follow = false
         clearWaypoints()
       })
       $('#goPointMap').click(function(){
         goMapPoint(goLat.value, goLon.value)
       })
       $('#home').click(function(){
         follow = false
         activeWaypoints = [startPosition[0], startPosition[1]]
         setCurrentTarget(startPosition[0], startPosition[1])
       })
       $('#go').click(function(){
         follow = false
         if(waypoints.length > 0){
           activeWaypoints = waypoints.slice(0);
           // go to next waypoint
           setCurrentTarget(activeWaypoints[0][0], activeWaypoints[0][1])
         }
       })

       $('#go-start').click(function(){
            if(hour.value != null && minutes.value != null){
               var hour = document.getElementById('fly-hou')
               var minutes = document.getElementById('fly-minutes')
               var msH = 3600000 * hour
               var msM = 60000 * minutes
               var msT = msH + msM
               var timeOutStart

               timeOutStart = setTimeout(function(){
                    follow = false
                    if(waypoints.length > 0){
                       activeWaypoints = waypoints.slice(0);
                       // go to next waypoint
                       setCurrentTarget2(activeWaypoints[0][0], activeWaypoints[0][1])
                    }
                   clearTimeout(timeOutStart)
               }, msT)
            }
       })
     })

    socket.on('connect', function(){
      socket.on('waypointReached', function(data){
       activeWaypoints.shift()
       if(activeWaypoints.length > 0){
          // go to next waypoint
          setCurrentTarget(activeWaypoints[0][0], activeWaypoints[0][1])
        }
      })
      socket.on('drone', function(data){
        if(data.lat != undefined){
          if (drone == null){
            drone = L.marker([data.lat, data.lon], {icon: droneIcon}).addTo(map)
            dronePath = L.polyline([[data.lat, data.lon]], {color: 'green'}).addTo(map);
          } else{
            drone.setLatLng([data.lat, data.lon])
            dronePath.addLatLng([data.lat, data.lon])
          }
        }
      })

    })




