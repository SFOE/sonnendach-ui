/**
 * This function detects is a string contains coordinates
 *
 */ 
var isCoordinates =  function(extent, query) {
  var DMSDegree = '[0-9]{1,2}[°|º]\\s*';
  var DMSMinute = '[0-9]{1,2}[\'|′]';
  var DMSSecond = '(?:\\b[0-9]+(?:\\.[0-9]*)?|\\.' +
  '[0-9]+\\b)("|\'\'|′′|″)';
  var DMSNorth = '[N]';
  var DMSEast = '[E]';
  var regexpDMSN = new RegExp(DMSDegree +
  '(' + DMSMinute + ')?\\s*' +
  '(' + DMSSecond + ')?\\s*' +
  DMSNorth, 'g');
  var regexpDMSE = new RegExp(DMSDegree +
  '(' + DMSMinute + ')?\\s*' +
  '(' + DMSSecond + ')?\\s*' +
  DMSEast, 'g');
  var regexpDMSDegree = new RegExp(DMSDegree, 'g');
  var regexpCoordinate = new RegExp(
  '([\\d\\.\']+)[\\s,]+([\\d\\.\']+)');

  var position;
  var valid = false;

  var matchDMSN = query.match(regexpDMSN);
  var matchDMSE = query.match(regexpDMSE);
  if (matchDMSN && matchDMSN.length == 1 &&
    matchDMSE && matchDMSE.length == 1) {
    var northing = parseFloat(matchDMSN[0].
    match(regexpDMSDegree)[0].
    replace('°' , '').replace('º' , ''));
    var easting = parseFloat(matchDMSE[0].
    match(regexpDMSDegree)[0].
    replace('°' , '').replace('º' , ''));
    var minuteN = matchDMSN[0].match(DMSMinute) ?
    matchDMSN[0].match(DMSMinute)[0] : '0';
    northing = northing +
    parseFloat(minuteN.replace('\'' , '').
      replace('′' , '')) / 60;
    var minuteE = matchDMSE[0].match(DMSMinute) ?
    matchDMSE[0].match(DMSMinute)[0] : '0';
    easting = easting +
    parseFloat(minuteE.replace('\'' , '').
      replace('′' , '')) / 60;
    var secondN =
    matchDMSN[0].match(DMSSecond) ?
    matchDMSN[0].match(DMSSecond)[0] : '0';
    northing = northing + parseFloat(secondN.replace('"' , '')
    .replace('\'\'' , '').replace('′′' , '')
    .replace('″' , '')) / 3600;
    var secondE = matchDMSE[0].match(DMSSecond) ?
    matchDMSE[0].match(DMSSecond)[0] : '0';
    easting = easting + parseFloat(secondE.replace('"' , '')
    .replace('\'\'' , '').replace('′′' , '')
    .replace('″' , '')) / 3600;
    position = ol.proj.transform([easting, northing],
      'EPSG:4326', 'EPSG:21781');
    if (ol.extent.containsCoordinate(
    extent, position)) {
      valid = true;
    }
  }

  var match =
    query.match(regexpCoordinate);
  if (match && !valid) {
    var left = parseFloat(match[1].replace('\'', ''));
    var right = parseFloat(match[2].replace('\'', ''));
    var position =
    [left > right ? left : right,
      right < left ? right : left];
    if (ol.extent.containsCoordinate(
      extent, position)) {
    valid = true;
    } else {
    position = ol.proj.transform(position,
      'EPSG:2056', 'EPSG:21781');
    if (ol.extent.containsCoordinate(
      extent, position)) {
      valid = true;
    } else {
      position =
      [left < right ? left : right,
        right > left ? right : left];
      position = ol.proj.transform(position,
      'EPSG:4326', 'EPSG:21781');
      if (ol.extent.containsCoordinate(
      extent, position)) {
      valid = true;
      }
    }
    }
  }
  return valid ?
    [Math.round(position[0] * 1000) / 1000,
    Math.round(position[1] * 1000) / 1000] : undefined;
};

function getOrientationText(orient, translator) {
    var orientation;
    if (orient >= 157 && orient <=180) {
       orientation = translator.get('north');
    } else if (orient >= -180 && orient <= -157) {
       orientation = translator.get('north');
    } else if (orient >= -158 && orient <= -113) {
       orientation = translator.get('northeast');
    } else if (orient >= -112 && orient <= -67) {
       orientation = translator.get('east');
    } else if (orient >= -68 && orient <= -23) {
       orientation = translator.get('southeast');
    } else if (orient >= -22 && orient <= 22) {
       orientation = translator.get('south');
    } else if (orient >= 23 && orient <= 67) {
       orientation = translator.get('southwest');
    } else if (orient >= 68 && orient <= 112) {
       orientation = translator.get('west');
    } else if (orient >= 113 && orient <= 156) {
       orientation = translator.get('northwest');
    } 
return (orientation);
};

var getSuitabilityText = function(suit, translator) {
  var suitability;
  if (suit == 1) {
    suitability = translator.get('low');
  } else if (suit == 2) {
    suitability = translator.get('medium');
  } else if (suit == 3) {
    suitability = translator.get('good');
  } else if (suit == 4) {
    suitability = translator.get('veryGood');
  } else if (suit == 5) {
    suitability = translator.get('excellent');
  }
  return (suitability);
};

var flyTo = function(map, dest, destRes) {
  var size = map.getSize();
  var source = map.getView().getCenter();
  var sourceRes = map.getView().getResolution();
  var dist = Math.sqrt(Math.pow(source[0] - dest[0], 2),
      Math.pow(source[1] - dest[1], 2));
  var duration = Math.min(Math.sqrt(300 + dist / sourceRes * 1000),
      3000);
  var start = +new Date();
  var pan = ol.animation.pan({
    duration: duration,
    source: source,
    start: start
  });
  if (sourceRes != destRes) {
    var bounce = ol.animation.bounce({
      duration: duration,
      resolution: Math.max(sourceRes, dist / 1000,
          // needed to don't have up an down and up again in zoom
          destRes * 1.2),
      start: start
    });
    var zoom = ol.animation.zoom({
      resolution: sourceRes,
      duration: duration,
      start: start
    });
    map.beforeRender(pan, zoom, bounce);
    map.getView().setResolution(destRes);
  } else {
    map.beforeRender(pan);
  }
  map.getView().setCenter(dest);
};


function formatNumber(number) {
  number = '' + number;

  if (number.length > 3) {
    var mod = number.length % 3; 
    var output = (mod > 0 ? (number.substring(0,mod)) : ''); 

    for (i=0 ; i < Math.floor(number.length / 3); i++) {

      if ((mod == 0) && (i == 0))
        output += number.substring(mod+ 3 * i, mod + 3 * i + 3);
      else
        output += '&apos;' + number.substring(mod + 3 * i, mod + 3 * i + 3);
      }
      return (output);
    }

  else
    return number;

};

var getToleranceInPixels = function(toleranceMeters, mapExtent, display) {
  if (!toleranceMeters) {
    return 0;
  }
  var mapMeterWidth = Math.abs(mapExtent[0] - mapExtent[2]);
  var mapMeterHeight = Math.abs(mapExtent[1] - mapExtent[3]);
  var imgPixelWidth = display[0];
  var imgPixelHeight = display[1];
  var factor = Math.max(mapMeterWidth / imgPixelWidth, mapMeterHeight / imgPixelHeight);
  if (isFinite(factor) && !isNaN(factor)) {
    return Math.ceil(toleranceMeters / factor);
  }
  return 0;
}
