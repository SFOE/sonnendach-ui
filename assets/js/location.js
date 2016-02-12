/**
 * Launch the search of an address from a coordinate (EPSG:21781).
 * Returns a promie.
 */
var geocode = function(map, coords) {
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

  $(document.body).addClass('ajax-address');
  return $.getJSON(url).then(function(data) {
    $(document.body).removeClass('ajax-address');
    return data;
  });
return $.getJSON(url);
};

/**
 * Get the current position of the user, then center the map on the
 * corresponding address.
 */
var getLocation = function(map, marker, onAddressFound, onError) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var coord21781 = ol.proj.transform([
        position.coords.longitude,
        position.coords.latitude
      ], 'EPSG:4326', map.getView().getProjection());
      geocode(map, coord21781).then(function(data) {
        // We assume the first of the list is the closest
        onAddressFound(map, marker, data.results[0], true, position.coords.accuracy);
      });
    }, function(error) {
      onError(getErrorMsg(error));
    });
  } else {
    onError(getErrorMsg());
  }
};

/**
 * Get a user friendly message when the geolocation is unavailable.
 */
var getErrorMsg = function(error) {
  var msg;
  if (!navigator.geolocation) {
    msg = translator.get('geolocErrorNotSupported');
  } else {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        msg = translator.get('geolocErrorPermDenied')
        break;
      case error.POSITION_UNAVAILABLE:
        msg = translator.get('geolocErrorPosUnavail');
        break;
      case error.TIMEOUT:
        msg = translator.get('geolocErrorTimeOut');
        break;
      case error.UNKNOWN_ERROR:
        msg = translator.get('geolocErrorUnknown');
        break;
    }
  }
  return msg;
 };
