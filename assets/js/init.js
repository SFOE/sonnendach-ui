/**
 * Display the marker at the coordinate of an address. Then search the best roof
 * associates to this address 
 */
var onAddressFound = function(map, marker, address) {
  if (address) {
    var coord, label;
    if (!address.attrs) { // Address comes from geolocation
      coord = [address.geometry.x, address.geometry.y];
      var attr = address.attributes;
      label = attr.strname1 + ' ' + attr.deinr + '<br>' +
          attr.plz4 + ' ' + attr.gdename;
    } else { // Address comes from search box
      // WARNING! Coordinates are inverted here.
      coord = [address.attrs.y, address.attrs.x];
      label = address.attrs.label.replace('<b>', '<br>')
          .replace('</b>', '');
    }
    marker.setPosition(coord);
    map.getView().setCenter(coord);
    map.getView().setResolution(0.1);
    $('#addressOutput').html(label);
    $(document.body).addClass('localized');
    
    // Search best roof at this address

  } else {
    clear(map, marker);
  }
}

// Put the page at the initial state
var clear = function(map, marker) {
  $('#search-container input').val('');
  marker.setPosition(undefined);
  $(document.body).removeClass('localized');
  $(document.body).removeClass('roof');
}

/**
 * Initialize the element of the app: map, search box, localizaton
 */
var init = function() {
  $.support.cors = true;
  window.API3_URL = 'https://mf-chsdi3.dev.bgdi.ch/ltfoa_solarenergie_daecher';
  
  var langs = ['de', 'fr'];
  var body = $(document.body);
  var locationBt = $('#location');
  var output = $('#myOutput');
  var markerElt = $('<div class="marker ga-crosshair"></div>');
  var t = {
    mainTitle: {
      de: 'Wie viel <strong>Strom</strong> und <strong>W&auml;rme</strong>' +
          ' aus Sonnenenergie kann ich auf meinem Dach produzieren?',
      fr: 'Combien d\'<trong>energie</strong> je peux produire sur  mon toit'
    },
    subTitle: {
      de: 'Finden Sie es heraus mit dem Solarkataster Schweiz.',
      fr: 'Decouvrez le cadastre solaire Suisse.'
    },
    locateMe: {
      de: 'Lokalisiere mich',
      fr: 'Localisez moi'
    }
  };
  var permalink = addPermalink();
  var translator = body.translate({
    lang: (langs.indexOf(permalink.lang) != -1) ? permalink.lang : langs[0],
    t: t
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
    output.html('');
    var coord = evt.coordinate;
    map.getView().setCenter(coord);
    marker.setPosition(coord); 
    //searchBestRoof(map, marker, coordi, onFeatureFound);
  });

  // Init the search input
  initSearch(map, marker, onAddressFound);
 
  // Init geoloaction button 
  locationBt.click(function() {
    getLocation(map, marker, onAddressFound);
  });

  // Remove the loading css class 
  body.removeClass('loading');
}

// Launch init function when document is ready
$(document).ready(init);
