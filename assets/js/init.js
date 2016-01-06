/**
 * Display the marker at the coordinate of an address. Then search the best roof
 * associates to this address 
 */
var onAddressFound = function(map, marker, address, autoSearchRoof) {
  $('#search-container input').val('');
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
      map.getView().setResolution(0.25);
      searchFeaturesFromCoord(map, coord).then(function(data) {
        onRoofFound(map, marker, data.results[0], true);
      });
    }
  } else {
    $(document.body).removeClass('localized');
    if (autoSearchRoof) {
      marker.setPosition(undefined);
      $(document.body).removeClass('roof no-roof');
      clearHighlight(map); 
    }
  }
};

var updateRoofInfo = function(map, marker, roof) {
  $('#pitchOutput').html(roof.attributes.neigung);
  $('#headingOutput').html(roof.attributes.ausrichtung + 180);
  $('#headingText').html(getOrientationText(roof.attributes.ausrichtung, permalink.lang));
  $('#areaOutput').html(Math.round(roof.attributes.flaeche));
  $(document.body).removeClass('no-roof').addClass('roof');
  // Clear the highlighted roof the add the new one
  var polygon = new ol.geom.Polygon(roof.geometry.rings); 
  var vectorLayer = clearHighlight(map);
  vectorLayer.getSource().addFeature(new ol.Feature(polygon));
  marker.setPosition(polygon.getInteriorPoint().getCoordinates());
  map.beforeRender(ol.animation.pan({source:map.getView().getCenter()}));
  map.getView().setCenter(marker.getPosition());
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
        updateRoofInfo(map, marker, bestRoof);
      });
    } else {
      updateRoofInfo(map, marker, roof);
    }
  } else {
    // Clear the highlighted roof
    clearHighlight(map);
    $(document.body).removeClass('roof').addClass('no-roof');
  }
}

// Remove the highlighted roof from the map
// Returns the vectorLayer cleared
var clearHighlight = function(map) {
  // Search the vector layer to highlight the roof
  var vectorLayer;
  map.getLayers().forEach(function(layer) {
    if (layer instanceof ol.layer.Vector) {
      vectorLayer = layer;
    }
  });

  // Remove the previous roof highlighted
  vectorLayer.getSource().clear();
  return vectorLayer;
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
    //autoPan: true,
    //autoPanMargin: 150 
  });
  map.addOverlay(marker);
  map.on('singleclick', function(evt){
    var coord = evt.coordinate;
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
    searchFeaturesFromCoord(map, coord).then(function(data) {
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
      map.getView().setResolution(0.1);
      onRoofFound(map, marker, data.feature);
      var coord = ol.extent.getCenter(data.feature.bbox);
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
