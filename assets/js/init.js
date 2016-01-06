/**
 * Display the marker at the coordinate of an address. Then search the best roof
 * associates to this address 
 */
var onAddressFound = function(map, marker, address, autoSearchRoof) {
  if (address) {
    var coord, label;
    if (!address.attrs) { // Address comes from geolocation
      coord = [address.geometry.x, address.geometry.y];
      var attr = address.attributes;
      label = attr.strname1 + ' ' + (attr.deinr || '') +
          ' <br>' + attr.plz4 + ' ' + attr.gdename;
    } else { // Address comes from search box
      // WARNING! Coordinates are inverted here.
      coord = [address.attrs.y, address.attrs.x];
      label = address.attrs.label.replace('<b>', '<br>')
          .replace('</b>', '');
    }
    $('#addressOutput').html(label);
    $(document.body).addClass('localized');
    
    // Search best roof at this address
    if (autoSearchRoof) {
      marker.setPosition(coord);
      map.getView().setCenter(coord);
      map.getView().setResolution(0.25);
      searchFeaturesFromMapCenter(map).then(function(data) {
        onRoofFound(map, marker, data.results[0], true);
      });
    }
  } else {
    clear(map, marker);
  }
};

var updateRoofInfo = function(roof) {
  $('#pitchOutput').html(roof.attributes.neigung);
  $('#headingOutput').html(roof.attributes.ausrichtung); 
  $('#areaOutput').html(Math.round(roof.attributes.flaeche));
  $(document.body).removeClass('no-roof');
  $(document.body).addClass('roof');
};

var replaceMarker = function(marker, roof) {
  if (roof.bbox) {
    var center = [(roof.bbox[0] + roof.bbox[2]) / 2,
                  (roof.bbox[1] + roof.bbox[3]) / 2];
    console.log(center);
    marker.setPosition(center);
  }
};

/**
 * Display the data of the roof selected
 */
var onRoofFound = function(map, marker, roof, findBestRoof) {
  if (roof) {
    // Find best roof for given building
    if (findBestRoof) {
      var url = API3_URL + '/rest/services/api/MapServer/find?' +
        'layer=ch.bfe.solarenergie-eignung-daecher&' +
        'searchField=building_id&' +
        'searchText=' + roof.attributes.building_id;
      $.getJSON(url, function(data) {
        var bestRoof = data.results[0];
        for (var i = 0; i < data.results.length; i++) {
          roofCandidate = data.results[i];
          if (roofCandidate.attributes.mstrahlung >
              bestRoof.attributes.mstrahlung) {
            bestRoof = roofCandidate;
          }
        }
        replaceMarker(marker, bestRoof);
        updateRoofInfo(bestRoof);
      });
    } else {
      updateRoofInfo(roof);
    }
  } else {
    $(document.body).removeClass('roof');
    $(document.body).addClass('no-roof');
  }
}

// Put the page at the initial state
var clear = function(map, marker) {
  $('#search-container input').val('');
  marker.setPosition(undefined);
  $(document.body).removeClass('localized');
  $(document.body).removeClass('roof');
  $(document.body).removeClass('no-roof');

}

/**
 * Initialize the element of the app: map, search box, localizaton
 */
var init = function() {
  $.support.cors = true;
  window.API3_URL = 'https://mf-chsdi3.dev.bgdi.ch/ltfoa_solarenergie_daecher';
  window.API3_SEARCHURL = 'https://api3.geo.admin.ch';
  
  var langs = ['de', 'fr'];
  var body = $(document.body);
  var locationBt = $('#location');
  var markerElt = $('<div class="marker ga-crosshair"></div>');
  var permalink = addPermalink();

  // Load the language
  var translator = body.translate({
    lang: (langs.indexOf(permalink.lang) != -1) ? permalink.lang : langs[0],
    t: sdTranslations // Object defined in tranlations.js
  });

  // Create map
  var map = createMap('map');
  var marker = new ol.Overlay({
    positioning:'bottom-center',
    element: markerElt[0],
    position: undefined
  });
  map.addOverlay(marker);
  map.on('singleclick', function(evt){
    var coord = evt.coordinate;
    marker.setPosition(coord); 
    map.getView().setCenter(coord);
    //We call the geocode function here to get the
    //address information for the clicked point using
    //the GWR layer.
    //The false parameter indicates that geocode does
    //not trigger a roof search.
    geocode(map, coord).then(function(data) {
      // We assume the first of the list is the closest
      onAddressFound(map, marker, data.results[0], false);
    });
    //Do roof search explicitely
    searchFeaturesFromMapCenter(map).then(function(data) {
      onRoofFound(map, marker, data.results[0], false);
    });
  });

  // Init the search input
  initSearch(map, marker, onAddressFound);
 
  // Init geoloaction button 
  locationBt.click(function() {
    getLocation(map, marker, onAddressFound);
  });

  // Display the fature from permalink
  if (permalink.featureId) {
    searchFeatureFromId(permalink.featureId).then(function(data) {
      onRoofFound(map, marker, data.feature);
      var coord = ol.extent.getCenter(data.feature.bbox);
      marker.setPosition(coord); 
      map.getView().setCenter(coord);
      geocode(map, coord).then(function(data) {
        // We assume the first of the list is the closest
        onAddressFound(map, marker, data.results[0]);
      });
    });
  }

  // Remove the loading css class 
  body.removeClass('loading');
}

// Launch init function when document is ready
$(document).ready(init);
