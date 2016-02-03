/**
 * Display the marker at the coordinate of an address. Then search the best roof
 * associates to this address 
 */
var onAddressFound = function(map, marker, address, autoSearchRoof, roofSearchTolerance) {
  $('.typeahead').typeahead('val', '');
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
    $(document.body).addClass('address-found');
    $(document.body).removeClass('localized-error');
    $(document.body).removeClass('no-address');
    
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
    }
  } else {
    $(document.body).removeClass('localized');
    $(document.body).removeClass('address-found');
    $(document.body).addClass('no-address');
    if (autoSearchRoof) {
      $(document.body).removeClass('roof no-roof');
      clearHighlight(map, marker); 
    }
  }
};

var updateRoofInfo = function(map, marker, roof) {

  var langs = ['de', 'fr'];
  var headers = ['0','1'];
  var permalink = addPermalink();

  var header = (headers.indexOf(permalink.header) != -1) ? permalink.header : headers[0];
  var lang = (langs.indexOf(permalink.lang) != -1) ? permalink.lang : langs[0]; 

  var suitability = getSuitabilityText(roof.attributes.klasse, window.translator);

  //fill content with attributes
  $('#mstrahlungOutput').html(formatNumber(roof.attributes.mstrahlung));
  $('#gstrahlungOutput').html(formatNumber(roof.attributes.gstrahlung));
  $('#pitchOutput').html(roof.attributes.neigung);
  $('#headingOutput').html(roof.attributes.ausrichtung + 180);
  $('#headingText').html(getOrientationText(roof.attributes.ausrichtung, window.translator));
  $('#areaOutput').html(formatNumber(Math.round(roof.attributes.flaeche)));
  $('#eignung').html(suitability.substr(0, 1).toUpperCase() + suitability.substr(1));
  $('#eignung3').html(suitability.substr(0, 1).toUpperCase() + suitability.substr(1));
  $('#stromertrag').html(formatNumber(Math.round((roof.attributes.gstrahlung*0.17*0.8)/100)*100));
  //$('#duschgaenge').html(roof.attributes.duschgaenge);

  //**** NEW

  var heatingDemand = '';
  if (roof.attributes.bedarf_heizung > 0) {
    heatingDemand += ' ' + formatNumber(Math.round(roof.attributes.bedarf_heizung))
            + ' ' + translator.get('kWh');
  } else {
    heatingDemand = '-';
  } 
  if (document.contains(document.getElementById("heatingDemand"))) {
  document.getElementById("heatingDemand").innerhtml =  $('#heatingDemand').html(heatingDemand);
  }

  var warmWaterDemand = '';
  if (roof.attributes.bedarf_warmwasser > 0) {
    warmWaterDemand += ' ' + formatNumber(roof.attributes.bedarf_warmwasser)
            + ' ' + translator.get('kWh');
  } else {
    warmWaterDemand = '-';
  } 
  if (document.contains(document.getElementById("warmWaterDemand"))) {
  document.getElementById("warmWaterDemand").innerhtml =  $('#warmWaterDemand').html(warmWaterDemand);
  }
    

  var reservoir = '';
  if (roof.attributes.volumen_speicher > 0) {
    reservoir += ' ' + formatNumber(roof.attributes.volumen_speicher)
            + ' ' + translator.get('liter');
  } else {
    reservoir = '-';
  } 
  if (document.contains(document.getElementById("reservoir"))) {
  document.getElementById("reservoir").innerhtml =  $('#reservoir').html(reservoir);
  } 
  
  
  var collectorSurface = '';
  if (roof.attributes.flaeche_kollektoren > 0) {
    collectorSurface += ' ' + formatNumber(Math.round(roof.attributes.flaeche_kollektoren))
            + ' ' + translator.get('m2');
  } else {
    collectorSurface = '-';
  } 
  if (document.contains(document.getElementById("collectorSurface"))) {
  document.getElementById("collectorSurface").innerhtml = $('#collectorSurface').html(collectorSurface);
  } 


  if (document.contains(document.getElementById("meanRadiation"))) {
    document.getElementById("meanRadiation").innerhtml = $('#meanRadiation').html(formatNumber(roof.attributes.mstrahlung));
  }

  if (document.contains(document.getElementById("totalRadiation"))) {
    document.getElementById("totalRadiation").innerhtml = $('#totalRadiation').html(formatNumber(roof.attributes.gstrahlung));
  }

  var heatDemand = '';
  if (roof.attributes.dg_waermebedarf > 0) {
    heatDemand += ' ' + formatNumber(Math.round(roof.attributes.dg_waermebedarf))
            + ' ' + translator.get('percent');
  } else {
    heatDemand = '-';
  } 
  if (document.contains(document.getElementById("heatDemand"))) {
  document.getElementById("heatDemand").innerhtml = $('#heatDemand').html(heatDemand);
  }

  //symbol for suitability
  if ($.contains(document.body, document.getElementById("eignungSymbol"))) {
    document.getElementById("eignungSymbol").src = 'images/s' + roof.attributes.klasse + '.png';
  }

  //text for suitability
  if (roof.attributes.klasse < 3) {
    $('#eignungText').html(translator.get('eignungText1') + ' <strong>' + suitability + '</strong> ' + translator.get('eignungText2'));
  } else {
    $('#eignungText').html(translator.get('eignungText3') + translator.get('eignungText1') + ' <strong>' + suitability + '</strong> ' + translator.get('eignungText2'));
  }


  if (roof.attributes.stromertrag < 1000) {
    $('#finanzertrag').html(formatNumber(Math.round(roof.attributes.finanzertrag/10)*10));
    $('#finanzertrag2').html(formatNumber(Math.round(roof.attributes.finanzertrag/10)*10));
  } else {
    $('#finanzertrag').html(formatNumber(Math.round(roof.attributes.finanzertrag/100)*100));
    $('#finanzertrag2').html(formatNumber(Math.round(roof.attributes.finanzertrag/100)*100));
  }

  if ($.contains(document.body, document.getElementById("eignungbutton2"))) {
    document.getElementById("eignungbutton2").className = 'button2 scrolly button2suit' + roof.attributes.klasse;
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

  if ($.contains(document.body, document.getElementById("printLink"))) {

    document.getElementById('printLink').href = 
      'print.html?featureId=' + roof.featureId +
      '&header=' + header +
      '&lang=' + lang;
  }  

  //***** NEW heat output value
  var solarHeat = '';
  
  if (roof.attributes.waermeertrag > 0) {
    solarHeat += ' ' + formatNumber(Math.round(roof.attributes.waermeertrag/100)*100)
            + ' ' + translator.get('solarHeatYear');
  } else {
    solarHeat = translator.get('solarthermieTitelnoHeat');
  }

  if (document.contains(document.getElementById("solarHeat"))) {
    document.getElementById("solarHeat").innerhtml = $('#solarHeat').html(solarHeat);
  } 

  
  //***** NEW saved heating costs
  var solarHeatCost = '';
  if (roof.attributes.dg_heizung > 0) {
    solarHeatCost += ' ' + roof.attributes.dg_heizung
            + ' ' + translator.get('savingSolarheatYear');
  } else {
    solarHeatCost = translator.get('solarthermieTitelnoHeat');
  }
  
  if (document.contains(document.getElementById("solarHeatCost"))) {
    document.getElementById("solarHeatCost").innerhtml = $('#solarHeatCost').html(solarHeatCost);
  }  


//***** NEW Get Month and Year
    var month = new Array();
    month[1] = "january";
    month[2] = "february";
    month[3] = "march";
    month[4] = "april";
    month[5] = "may";
    month[6] = "june";
    month[7] = "july";
    month[8] = "august";
    month[9] = "september";
    month[10] = "october";
    month[11] = "november";
    month[12] = "december";
  

   var i;
   var Y = 0;
   var provDate = roof.attributes.gs_serie_start.substring(0,10);
   var date = new Date(provDate);
   date = new Date(date.setMonth(date.getMonth()))
   var text1 = '';
   var text2 = '';
   var year = '';
   var X = roof.attributes.monate;
    for (i = 0; i < 12; i++) {
      Y = '' + i;
      date.setMonth(date.getMonth()-1);
      year = date.getFullYear(date);
      text1 = translator.get(month[roof.attributes.monate[i]]);
      text2 = text1 + '&nbsp;' + year;
      if (document.contains(document.getElementById("month" + Y))) {
        document.getElementById("month" + Y).innerhtml = $('#month' + Y).html(text2);
      }
    }  


//***** NEW Get monats_ertrag
  var j;
  var YY = '';
  var XX = roof.attributes.monats_ertrag;
  for (j = 0; j < 12; j++) {
    YY = '' + j;
    if (document.contains(document.getElementById("powerProductionMonth"+ YY))) {
      document.getElementById("powerProductionMonth"+ YY).innerhtml = $('#powerProductionMonth' + YY).html(formatNumber(Math.round(roof.attributes.monats_ertrag[j] * roof.attributes.flaeche)));
    }
  } 

//***** NEW Get heizgradtage
  var k;
  var YYY = '';
  var XXX = roof.attributes.heizgradtage;
  for (k = 0; k < 12; k++) {
    YYY = '' + k;
    if (document.contains(document.getElementById("powerProductionMonth" + YYY))) {
      document.getElementById("powerProductionMonth" + YYY).innerhtml = $('#heatingDaysMonth' + YYY).html(formatNumber(Math.round(roof.attributes.heizgradtage[k]))); 
    }
  } 
   
//************


  // Clear the highlighted roof the add the new one
  var polygon = new ol.geom.Polygon(roof.geometry.rings); 
  var vectorLayer = clearHighlight(map, marker);
  vectorLayer.getSource().addFeature(new ol.Feature(polygon));
  marker.setPosition(polygon.getInteriorPoint().getCoordinates());
  flyTo(map, marker.getPosition(), 0.25);

  if (document.contains(document.getElementById("thisIsPrint"))) {
    updateBarChart(roof, roof.attributes.klasse, roof.attributes.flaeche, 1);  
  } else {
    updateBarChart(roof, roof.attributes.klasse, roof.attributes.flaeche, 0);
  }

  
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
var init = function(nointeraction) {
  $.support.cors = true;
  window.API3_URL = 'https://mf-chsdi3.dev.bgdi.ch/ltfoa_solarenergie_daecher';
  window.API3_SEARCHURL = 'https://api3.geo.admin.ch';
  
  var langs = ['de', 'fr'];
  var headers = ['0','1'];
  var body = $(document.body);
  var locationBt = $('#location');
  var markerElt = $('<div class="marker ga-crosshair"></div>');
  var permalink = addPermalink();

  // Load Header
  var header = (headers.indexOf(permalink.header) != -1) ? permalink.header : headers[0];

  if (header == '1') {
    //EnergieSchweiz Header
    $('#ech').removeClass('hide');
    $('#orange').removeClass('hide');
  } else {
    $('#eig').removeClass('hide');
    $('#red').removeClass('hide');
  }

  // Load the language
  var lang = (langs.indexOf(permalink.lang) != -1) ? permalink.lang : langs[0]; 
  window.translator = $('html').translate({
    lang: lang,
    t: sdTranslations // Object defined in tranlations.js
  });

  //add locate-symbol
  if ($.contains(document.body, document.getElementById("location"))) {
    document.getElementById("location").innerHTML = document.getElementById("location").innerHTML + ' <span class="icon fa-location-arrow"></span>';
  }

  // Create map
  var map = createMap('map', lang, nointeraction);
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

  // Display the feature from permalink
  if (permalink.featureId) {
    searchFeatureFromId(permalink.featureId).then(function(data) {
      onRoofFound(map, marker, data.feature);
      var coord = ol.extent.getCenter(data.feature.bbox);
      geocode(map, coord).then(function(data) {
        // We assume the first of the list is the closest
        onAddressFound(map, marker, data.results[0], false, 50.0);
      });

      goTo('one');
      
      // Add the featureId to the lang link href
      $('#lang a').attr('href', function(index, attr) {
        this.href = attr + '&featureId=' + permalink.featureId;
      });
    });
  }

  // Remove the loading css class 
	body.removeClass('is-loading');
}