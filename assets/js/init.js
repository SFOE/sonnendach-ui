var init = function() {
  $.support.cors = true;
  window.API3_URL = 'https://mf-chsdi3.dev.bgdi.ch/';
  
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
    marker.setPosition(coord); //crosshair
    searchFeaturesInExtent(map); //Abfrage aktualisieren
  });

  // Init the search input
  initSearch(map, marker);
 
  // Init geoloaction button 
  locationBt.click(function() {
    getLocation(map, marker);
  });

  // Remove the loading css class 
  body.removeClass('loading');
}

// Launch init function when document is ready
$(document).ready(init);
