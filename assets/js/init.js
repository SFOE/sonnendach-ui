var init = function() {
   // Create map
  var map = createMap('map');
	var marker= new ol.Overlay({
	  positioning:'bottom-center',
	  element: mapJQ('<div class="marker ga-crosshair"></div>')[0]
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
  
  mapJQ('#location').click(function() {
    getLocation(map, marker);
  });
}		
