var addPermalink = function() {
  var tryDecodeURIComponent = function(value) {
    try {
      return decodeURIComponent(value);
    } catch (e) {
    // Ignore any invalid uri component
    }
  };

  var parseKeyValue = function(keysValues) {
    var obj = {}; 
    var kv;
    var key;
    var arr = (keysValues || '').split('&');
    for (var i = 0; i < arr.length; i++) {
      var keyValue = arr[i];
      if (keyValue) {
        kv = keyValue.split('=');
        key = tryDecodeURIComponent(kv[0]);
        if (key && kv[1]) {
          obj[key] = tryDecodeURIComponent(kv[1]);
        }    
      }
    }
    return obj;
  };

  loc = window.location;
  var res = parseKeyValue(loc.search.substring(1));
  var lang =  (res.lang || '').split(',');
  var featureId = (res.featureId || '').split(',');
  var header = (res.header || '').split(',');
  var building = (res.building || '').split(',');
  var X = (res.X || '').split(',');
  var Y = (res.Y || '').split(',');
  var E = (res.E || '').split(',');
  var N = (res.N || '').split(',');  
  var zoom = (res.zoom || '').split(',');

  var url = {
    lang: (lang[0].length) ? lang[0] : undefined,
    featureId: (featureId[0].length) ? featureId[0] : undefined,
    header: (header[0].length) ? header[0] : undefined,
    building: (building[0].length) ? building[0] : undefined,
    X: (X[0].length) ? X[0] : undefined,
    Y: (Y[0].length) ? Y[0] : undefined,
    E: (E[0].length) ? E[0] : undefined,
    N: (N[0].length) ? N[0] : undefined,    
    zoom: (zoom[0].length) ? zoom[0] : undefined,
  }; 
  return url;
};
