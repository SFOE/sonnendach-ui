/**
 * Search all the features available in the current map extent then display them in a HTML list.
 */
var searchFeaturesInExtent = function(map) {
  var center,
      jsonQuery = $('#json-query');
      featuresList = $('#features-list');
      output = document.getElementById("myOutput");
 
  // Ausgabe API3-Query
  jsonQuery.html('<i>API REST Identify Feature - Query<br>Abfrage an einer' +
      'Punktkoordinate (Extent = Koordinate, tolerance = 0)</i><br><br>' +
      API3_URL + '/rest/services/api/MapServer/identify?' +
      'geometryType=esriGeometryPoint' +
      '&returnGeometry=false' +
      '&layers=all:ch.bfe.energiestaedte' +
      '&geometry=' + map.getView().getCenter().join(',') +
      '&mapExtent=' + map.getView().getCenter().join(',') + ',' + map.getView().getCenter().join(',') +
      '&imageDisplay=' + map.getSize().join(',') + ',96' +
      '&tolerance=0' +
      '&lang=de');
  
  $.getJSON(API3_URL + '/rest/services/api/MapServer/identify?' + //url
      'geometryType=esriGeometryPoint' +
      '&returnGeometry=false' +
      '&layers=all:ch.bfe.energiestaedte' +
      '&geometry=' + map.getView().getCenter().join(',') +
      '&mapExtent=' + map.getView().getCenter().join(',') + ',' + map.getView().getCenter().join(',') +
      '&imageDisplay=' + map.getSize().join(',') + ',96' +
      '&tolerance=0' + 
      '&lang=de', 
    function(data) { //success(data)
      featuresList.empty();
      if (data.results && data.results.length > 0) {
        var items = [];
        $.each(data.results, function(key, val ) {
          output.innerHTML = 
          '<i>Eigener Output mit Zugriff auf einzelne Attribute anstatt fixfertige Objektinfo aus geo.admin.' +
          'Kann beliebig angepasst, gestaltet und mit Logik erweitert (z. B. kWh in Franken umrechnen) werden.</i><br><br>' +
          'Punktezahl: <b>' + val.attributes.punktezahl + '</b><br>' +
          'Energiestadt: <b>' + val.attributes.name + '</b>';
          
        
          $.ajax(API3_URL + '/rest/services/api/MapServer/' +
            val.layerBodId + '/' +
            val.featureId + '/htmlPopup?lang=de',{
            dataType: "html"
          }).done(function(data) {
            featuresList.append(data);
          });       
        });
      }
    }
  );
};


/**
 * Transform the input element in search box
 */
var initSearch = function(map, marker) {
  var view = map.getView();
	// Get swisssearch parameter
	var swisssearch = window.sessionStorage.getItem('swisssearch');
	if (swisssearch) {
	  var center = swisssearch.split(',');
	  center = [parseInt(center[0], 10), parseInt(center[1], 10)];
	  marker.setPosition(center);
	  view.setCenter(center);
	  searchFeaturesInExtent(map);
	}

  // Create the suggestion engine
	var mySource = new Bloodhound({
	   limit: 30,
	   datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
	   queryTokenizer: function(query) {
		  var center = isCoordinates(view.getProjection().getExtent(), query);
		  if (center) {
			  view.setCenter(center);
			  marker.setPosition(center);
		  }
		  return Bloodhound.tokenizers.whitespace;
	   },
	   remote: {   
		   url: API3_URL + '/rest/services/api/SearchServer?lang=de&searchText=%QUERY&type=locations',
		   filter: function(locations) {
			   var results = [];
			   if (locations.results) {
			     $.each(locations.results, function(key, location) {
				     if (location.attrs.origin == 'address' || location.attrs.origin == 'parcel') {
				       results.push(location);
	 			     }
	 		     });
			   }
			   return results;
		   }
	   }
	});

	// this kicks off the loading and processing of local and prefetch data
	// the suggestion engine will be useless until it is initialized
	mySource.initialize();

  // Create the typeahead search box 
	var searchInput = $('#search-container input');
	searchInput.typeahead(null,{
	  name: 'location',
	  displayKey: function(location) {
		  return location.attrs.label.replace('<b>', '').replace('</b>', '');
	  },
	  source: mySource.ttAdapter(),
	  templates: {
		  suggestion: function(location) {
		    return '<p>' + location.attrs.label + '</p>' ;
		  }
	  }                                      
	});

	var parseExtent = function(stringBox2D) {
	  var extent = stringBox2D.replace('BOX(', '').replace(')', '').replace(',', ' ').split(' ');
	  return $.map(extent, parseFloat);
	};

	searchInput.placeholder();

	searchInput.on('typeahead:selected', function(evt, location, suggName) {
		var originZoom = {
		   address: 10,
		   parcel: 10,
		   sn25: 8,
		   feature: 7
		};
		var origin = location.attrs.origin;
		var extent = [0, 0, 0, 0];
		if (location.attrs.geom_st_box2d) {
		  extent = parseExtent(location.attrs.geom_st_box2d);
		} else if (location.attrs.x && location.attrs.y) {
		  var x = location.attrs.y;
		  var y = location.attrs.x
		  extent = [x, y, x, y]; 
		}
		window.sessionStorage.removeItem('swisssearch', '');
		if (originZoom.hasOwnProperty(origin)) {
		  var center = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
		  view.setZoom(13);
		  view.setCenter(center);
		  marker.setPosition(center); //crosshair
		  window.sessionStorage.setItem('swisssearch', center);
		} else {
		   view.fitExtent(extent, map.getSize());
		}
		searchFeaturesInExtent(map);
	});
};
