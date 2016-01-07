/**
 * Launch the search of an address from a coordinate (EPSG:21781).
 * Returns a promie.
 */
var geocode = function(map, coords) {
  var addressOutput = $('#addressOutput');
  var mapExtent = map.getView().calculateExtent(map.getSize());
  // Get pixel tolerance for 100.0 meters
  var pixelTolerance = getToleranceInPixels(100.0, mapExtent, map.getSize());
  var url = API3_URL + '/rest/services/api/MapServer/identify?' +
     'geometryType=esriGeometryPoint' +
     '&geometry=' + coords.toString() +
     '&imageDisplay=' + map.getSize().toString() + ',96' +
     '&mapExtent=' + mapExtent.toString() +
     '&tolerance=' + pixelTolerance +
     '&order=distance' +
     '&layers=all:ch.bfs.gebaeude_wohnungs_register&returnGeometry=true';
  return $.getJSON(url);
}

/**
 * Get the current position of the user, then center the map on the
 * corresponding address.
 */
var getLocation = function(map, marker, onAddressFound) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
     console.log(position);
     var coord21781 = ol.proj.transform([
       position.coords.longitude,
       position.coords.latitude
     ], 'EPSG:4326', map.getView().getProjection());
     geocode(map, coord21781).then(function(data) {
       // We assume the first of the list is the closest
       onAddressFound(map, marker, data.results[0], true);
     });
    }, showError);
  } else {
    var x = document.getElementById("demo");
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

/**
 * Display an alert message if we don't get the position.
 */
var showError = function(error) {
  var msg;
  switch(error.code) {
    case error.PERMISSION_DENIED:
      msg = "User denied the request for Geolocation."
      break;
    case error.POSITION_UNAVAILABLE:
      msg = "Location information is unavailable."
      break;
    case error.TIMEOUT:
      msg = "The request to get user location timed out."
      break;
    case error.UNKNOWN_ERROR:
      msg = "An unknown error occurred."
      break;
  }
  alert(msg);
}
