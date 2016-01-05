var init = function() {
  $.support.cors = true;
  window.API3_URL = 'https://mf-chsdi3.dev.bgdi.ch/';
        
  // Create map
  var map = createMap('map');
	var marker= new ol.Overlay({
	  positioning:'bottom-center',
	  element: $('<div class="marker ga-crosshair"></div>')[0]
	});
	map.addOverlay(marker);
  map.on('singleclick', function(evt){
    document.getElementById("myOutput").innerHTML = '';
    var coord = evt.coordinate;
    map.getView().setCenter(coord);
    marker.setPosition(coord); //crosshair
    searchFeaturesInExtent(map); //Abfrage aktualisieren
  });

  // Init the search input
  initSearch(map, marker);
 
  // Init Geoloaction button 
  $('#location').click(function() {
    getLocation(map, marker);
  });
}		
