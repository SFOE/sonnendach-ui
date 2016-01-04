//Lokalisiert mich!

function getLocation(map, marker) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      showPosition(map, marker, position);
    }, showError);
  } else {
    var x = document.getElementById("demo");
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}
  
function showPosition(map, marker, position) {
  var x = document.getElementById("demo");
  x.innerHTML="Latitude: " + position.coords.latitude + 
  "<br>Longitude: " + position.coords.longitude;

  var center = isCoordinates(map.getView().getProjection().getExtent(),
      position.coords.latitude + ' ' + position.coords.longitude);
  if (center) {
    map.getView().setCenter(center);
    console.log(center);
    map.getView().setResolution(0.1);
    marker.setPosition(center);
    searchFeaturesInExtent(map); //Abfrage aktualisieren
  }
}

function showError(error) {
  switch(error.code) {
      case error.PERMISSION_DENIED:
          x.innerHTML = "User denied the request for Geolocation."
          break;
      case error.POSITION_UNAVAILABLE:
          x.innerHTML = "Location information is unavailable."
          break;
      case error.TIMEOUT:
          x.innerHTML = "The request to get user location timed out."
          break;
      case error.UNKNOWN_ERROR:
          x.innerHTML = "An unknown error occurred."
          break;
  }
}
