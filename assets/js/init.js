/**
 * Display the marker at the coordinate of an address. Then search the best roof
 * associates to this address 
 */
var onAddressFound = function(map, marker, address, autoSearchRoof, roofSearchTolerance) {
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
    $(document.body).addClass('localized').removeClass('localized-error');
    
    // Search best roof at this address
    if (autoSearchRoof) {
      marker.setPosition(coord);
      searchFeaturesFromCoord(map, coord, roofSearchTolerance).then(function(data) {
        onRoofFound(map, marker, data.results[0], true);
        // If no roof found zoom on the marker
        if (!data.results.length) {
          flyTo(map, coord, 0.25);
        }
      });
    } else {
      $('#search-container input').val('');
    }
  } else {
    $(document.body).removeClass('localized');
    if (autoSearchRoof) {
      $(document.body).removeClass('roof no-roof');
      clearHighlight(map, marker); 
    }
  }
};

var updateRoofInfo = function(map, marker, roof) {
  var suitability = getSuitabilityText(roof.attributes.klasse, window.translator);

  //fill content with attributes
  $('#pitchOutput').html(roof.attributes.neigung);
  $('#headingOutput').html(roof.attributes.ausrichtung + 180);
  $('#headingText').html(getOrientationText(roof.attributes.ausrichtung, window.translator));
  $('#areaOutput').html(formatNumber(Math.round(roof.attributes.flaeche)));
  $('#eignung').html(suitability.substr(0, 1).toUpperCase() + suitability.substr(1));
  $('#eignung2').html(suitability);
  $('#eignung3').html(suitability.substr(0, 1).toUpperCase() + suitability.substr(1));
  $('#stromertrag').html(formatNumber(Math.round((roof.attributes.gstrahlung*0.17*0.8)/100)*100));
  //$('#duschgaenge').html(roof.attributes.duschgaenge);

  //symbol for suitability
  document.getElementById("eignungSymbol").src = 'images/' + roof.attributes.klasse + '.png';

  if (roof.attributes.stromertrag < 1000) {
    $('#finanzertrag').html(formatNumber(Math.round(roof.attributes.finanzertrag/10)*10));
    $('#finanzertrag2').html(formatNumber(Math.round(roof.attributes.finanzertrag/10)*10));
  } else {
    $('#finanzertrag').html(formatNumber(Math.round(roof.attributes.finanzertrag/100)*100));
    $('#finanzertrag2').html(formatNumber(Math.round(roof.attributes.finanzertrag/100)*100));
  }

  //add css-class
  $(document.body).removeClass('no-roof').addClass('roof');
  
  // check if no waermeertrag and if no dg_heizung
  var titleHeat = '';
  if (roof.attributes.waermeertrag > 0) {
    titleHeat += '<strong>' + formatNumber(Math.round(roof.attributes.waermeertrag/100)*100)
                + '</strong> ' + translator.get('solarthermieTitel1');

    if (roof.attributes.dg_heizung > 0) {
      titleHeat += ' ' + roof.attributes.dg_heizung + '&nbsp;'
                   + translator.get('solarthermieTitel2');
    }

  } else {
    titleHeat = translator.get('solarthermieTitelnoHeat');
  }

  $('#heatTitle').html(titleHeat);

  var textHeat = '';
  if (roof.attributes.duschgaenge > 0) {
    textHeat += translator.get('solarthermieText1') 
                + ' ' + roof.attributes.duschgaenge
                + translator.get('solarthermieText2');
  } else {
    textHeat = '';
  }

  $('#heatText').html(textHeat);

  // Clear the highlighted roof the add the new one
  var polygon = new ol.geom.Polygon(roof.geometry.rings); 
  var vectorLayer = clearHighlight(map, marker);
  vectorLayer.getSource().addFeature(new ol.Feature(polygon));
  marker.setPosition(polygon.getInteriorPoint().getCoordinates());
  flyTo(map, marker.getPosition(), 0.25);
};

/**
 * Display the data of the roof selected
 */
var onRoofFound = function(map, marker, roof, findBestRoof) {
  if (roof) {
    // Find best roof for given building
    if (findBestRoof) {
      searchBestRoofFromBuildingId(roof.attributes.building_id).then(function(roof) {
        updateRoofInfo(map, marker, roof);
      });
    } else {
      updateRoofInfo(map, marker, roof);
    }
  } else {
    // Clear the highlighted roof
    clearHighlight(map, marker);
    $(document.body).removeClass('roof').addClass('no-roof');
  }
}

// Remove the highlighted roof from the map
// Returns the vectorLayer cleared
var clearHighlight = function(map, marker) {
  marker.setPosition(undefined);
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
  var lang = (langs.indexOf(permalink.lang) != -1) ? permalink.lang : langs[0]; 
  window.translator = $('html').translate({
    lang: lang,
    t: sdTranslations // Object defined in tranlations.js
  });

  // Create map
  var map = createMap('map', lang);
  var marker = new ol.Overlay({
    positioning:'bottom-center',
    element: markerElt[0],
    position: undefined,
    stopEvent: false
    //autoPan: true,
    //autoPanMargin: 150 
  });
  map.addOverlay(marker);
  map.on('singleclick', function(evt){
    var coord = evt.coordinate;
   
    //Do roof search explicitely
    searchFeaturesFromCoord(map, coord, 0.0).then(function(data) {
      onRoofFound(map, marker, data.results[0], false);
      // We call the geocode function here to get the
      // address information for the clicked point using
      // the GWR layer.
      // The false parameter indicates that geocode does
      // not trigger a roof search.
      // Relouch the roof search with the coordinate of address if necessary.
      var relaunchRoofSearch = (data.results.length == 0);
      geocode(map, coord).then(function(data) {
        // We assume the first of the list is the closest
        onAddressFound(map, marker, data.results[0], relaunchRoofSearch, 0.0);
      });
    });
  });

  // Init the search input
  initSearch(map, marker, onAddressFound);
 
  // Init geoloaction button 
  locationBt.click(function() {
    body.removeClass('localized-error');
    getLocation(map, marker, onAddressFound, function(msg) {
      $(document.body).addClass('localized-error');
      $('#locationError').html(msg);
    });
  });

  // Display the fature from permalink
  if (permalink.featureId) {
    searchFeatureFromId(permalink.featureId).then(function(data) {
      onRoofFound(map, marker, data.feature);
      var coord = ol.extent.getCenter(data.feature.bbox);
      geocode(map, coord).then(function(data) {
        // We assume the first of the list is the closest
        onAddressFound(map, marker, data.results[0], false, 50.0);
      });

      window.scroll(0, $('#one').offset().top);
      
      // Add the featureId to the lang link href
      $('#lang a').attr('href', function(index, attr) {
        this.href = attr + '&featureId=' + permalink.featureId;
      });
    });
  }

  // Remove the loading css class 
	body.removeClass('is-loading');
}

// Launch init function when document is ready
$(document).ready(init);
