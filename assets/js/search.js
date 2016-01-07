/**
 * Launch the search of all the features available on the center of the map.
 * Returns a promise.
 */
var searchFeaturesFromCoord = function(map, coord) {
  var center = map.getView().getCenter().toString();
  var url = API3_URL + '/rest/services/api/MapServer/identify?' + //url
      'geometryType=esriGeometryPoint' +
      '&returnGeometry=true' +
      '&layers=all:ch.bfe.solarenergie-eignung-daecher' +
      '&geometry=' + coord +
      '&mapExtent=' + coord + ',' + coord +
      '&imageDisplay=' + map.getSize().toString() + ',96' +
      '&tolerance=0' + 
      '&lang=de';
  return $.getJSON(url);
};

/**
 * Launch the search of a feature defined by its id.
 * Returns a promise.
 */
var searchFeatureFromId = function(featureId) {
  var url = API3_URL + '/rest/services/all/MapServer/' +
      'ch.bfe.solarenergie-eignung-daecher/' + 
      featureId + '?geometryFormat=esriGeojson';
  return $.getJSON(url);
};

/**
 * Transform the input element in search box
 */
var initSearch = function(map, marker, onAddressFound) {
  var view = map.getView();
	// Get swisssearch parameter
	var swisssearch = window.sessionStorage.getItem('swisssearch');
	/*if (swisssearch) {
	  var center = swisssearch.split(',');
	  center = [parseInt(center[0], 10), parseInt(center[1], 10)];
	  marker.setPosition(center);
	  view.setCenter(center);
	  searchFeaturesInExtent(map);
	}*/

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
		   url: API3_SEARCHURL + '/rest/services/api/SearchServer?lang=de&searchText=%QUERY&type=locations',
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

  searchInput.attr('placeholder', translator.get('placeholder')); 
	searchInput.placeholder();

	searchInput.on('typeahead:selected', function(evt, location, suggName) {
		onAddressFound(map, marker, location, true);
	});
};
