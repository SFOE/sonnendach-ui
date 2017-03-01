var boundingExtentXYs_ = function(xs, ys) {
    var minX = Math.min.apply(null, xs);
    var minY = Math.min.apply(null, ys);
    var maxX = Math.max.apply(null, xs);
    var maxY = Math.max.apply(null, ys);
    return [minX, minY, maxX, maxY];
};

var getForViewAndSize = function(center, resolution, rotation, size) {
    var dx = resolution * size[0] / 2;
    var dy = resolution * size[1] / 2;
    var cosRotation = Math.cos(rotation);
    var sinRotation = Math.sin(rotation);
    /** @type {Array.<number>} */
    var xs = [-dx, -dx, dx, dx];
    /** @type {Array.<number>} */
    var ys = [-dy, dy, -dy, dy];
    var i, x, y;
    for (i = 0; i < 4; ++i) {
        x = xs[i];
        y = ys[i];
        xs[i] = center[0] + x * cosRotation - y * sinRotation;
        ys[i] = center[1] + x * sinRotation + y * cosRotation;
    }
    return boundingExtentXYs_(xs, ys);
};

/**
 * Launch the search of all the features available at a cordinates.
 * Returns a promise.
 */
var searchFeaturesFromCoord = function(map, coord, tolerance) {
  var center = map.getView().getCenter().toString();
  var mapExtent = map.getView().calculateExtent(map.getSize());

  //We assure the resolution/zoom level is not pointing to overview
  if (map.getView().getResolution() > 20.0) {
    mapExtent = getForViewAndSize(coord, 20.0, 0.0, map.getSize());
  }
  var pixelTolerance = getToleranceInPixels(tolerance, mapExtent, map.getSize());
  if (pixelTolerance <= 0) {
    pixelTolerance = 1;
  }
  var url = API3_URL + '/rest/services/api/MapServer/identify?' + //url
      'geometryType=esriGeometryPoint' +
      '&returnGeometry=true' +
      '&layers=all:ch.bfe.solarenergie-eignung-daecher' +
      '&geometry=' + coord +
      '&mapExtent=' + mapExtent.toString() +
      '&imageDisplay=' + map.getSize().toString() + ',96' +
      '&tolerance=' + pixelTolerance +
      '&order=distance' +
      '&lang=de';
  $(document.body).addClass('ajax-roof');
  return $.getJSON(url).then(function(data) {
    $(document.body).removeClass('ajax-roof');

    //Wenn kein Dach gefunden, Pruefung ob im Abdeckungsperimeter:
    if (!data.results[0]) {
      var perimeterURL = API3_URL + '/rest/services/api/MapServer/identify?' + //url
        'geometryType=esriGeometryPoint' +
        '&returnGeometry=true' +
        '&layers=all:ch.bfe.solarenergie-eignung-daecher' +
        '&geometry=' + coord +
        '&mapExtent=411600,55800,891600,330550' +
        '&imageDisplay=1920,1099,96' +
        '&tolerance=1' +
        '&order=distance' +
        '&lang=de';
      return $.getJSON(perimeterURL).then(function(perimeterData) {
        if (perimeterData.results[0]) {
          return {results: [{
            perimeter: true
          }]};
        } else {
          return {results: [{
            perimeter: false
          }]}
        }
      });
    } else if (data.results[0].featureId == -999) {
      return {results: [{
        perimeter: true
      }]};
    } else {
      return data;
    }
  });
};


/**
 * Launch the search of a feature defined by its id.
 * Returns a promise.
 */
var searchFeatureFromId = function(featureId) {
  var url = API3_URL + '/rest/services/all/MapServer/' +
      'ch.bfe.solarenergie-eignung-daecher/' + 
      featureId + '?geometryFormat=esriGeojson';
  $(document.body).addClass('ajax-roof');
  return $.getJSON(url).then(function(data) {
    $(document.body).removeClass('ajax-roof');
    return data;
  });
};

/**
 * Launch the search for the best roof of a building.
 * Returns a promise.
 */
var searchBestRoofFromBuildingId = function(buildingId) {
  var url = API3_URL + '/rest/services/api/MapServer/find?' +
      'layer=ch.bfe.solarenergie-eignung-daecher&' +
      'searchField=building_id&' +
      'searchText=' + buildingId +
      '&contains=false';
  $(document.body).addClass('ajax-roof');
  return $.getJSON(url).then(function(data) {
    var bestRoof = data.results[0];
    for (var i = 0; i < data.results.length; i++) {
      roofCandidate = data.results[i];
      if (roofCandidate.attributes.mstrahlung >
          bestRoof.attributes.mstrahlung) {
        bestRoof = roofCandidate;
      }
    }
    $(document.body).removeClass('ajax-roof');
    return bestRoof;
  });
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
       wildcard: '%QUERY',
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

  // Create the 2 typeahead search box
  var searchInputs = $('.typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 3
  }, {
	  name: 'location',
	  displayKey: function(location) {
		  return location.attrs.label.replace('<b>', '').replace('</b>', '');
	  },
    limit: 30,
	  source: mySource.ttAdapter(),
	  templates: {
		  suggestion: function(location) {
		    return '<div>' + location.attrs.label + '</div>';
		  }
	  }                                      
	});
  searchInputs.attr('placeholder', translator.get('placeholder')); 
	searchInputs.placeholder();
	searchInputs.on('typeahead:selected', function(evt, location, suggName) {
		onAddressFound(map, marker, location, true, 0.0);
    //scroll to section one
    if (this.id == 'searchTypeahead1') {
      goTo('one');
      $(this).blur();
    }
	}).on('typeahead:asyncrequest', function() {
    $(this).addClass('loading'); 
  }).on('typeahead:asyncreceive', function() {
    $(this).removeClass('loading'); 
  });
};
