/**
 * This function creates the map with all layers, interactions and controls
 *
 * returns an openlayers map
 */
var createMap = function(eltId) {
	
  // Create the layers
  var layers = getLayersConfig();
  var layer1Id = 'ch.swisstopo.swissimage';
  var layer1Config = layers[layer1Id];
  var layer1 = new ol.layer.Tile({
    minResolution: layer1Config.minResolution,
    maxResolution: layer1Config.maxResolution,
    opacity: layer1Config.opacity,
    source: getWmts(layer1Id, layer1Config),
    useInterimTilesOnError: false
  })
  var layer2Id = 'ch.bfe.energiestaedte';
  var layer2Config = layers[layer2Id];
  var layer2 = new ol.layer.Tile({
    minResolution: layer2Config.minResolution,
    maxResolution: layer2Config.maxResolution,
    opacity: layer2Config.opacity,
    source: getWms(layer2Id, layer2Config),
    useInterimTilesOnError: false
  })
	
  // Create a the openlayer map
  var extent = [420000, 30000, 900000, 350000];
  var proj = ol.proj.get('EPSG:21781');
  proj.setExtent(extent);
  var map = new ol.Map({
    target: eltId,
    layers: [layer1, layer2],
    view: new ol.View({
      resolutions: [
        650, 500, 250, 100, 50, 20, 10, 5, 2.5, 2, 1, 0.5, 0.25, 0.1
      ],
      extent: extent,
      projection: proj,
      center: [660000, 190000],
      zoom: 0
    }),
    controls: ol.control.defaults({
		  attributionOptions: ({
		    collapsible: false
		  })
    }),
    logo: false
  });
  map.addControl(new ol.control.ScaleLine());
  
  return map;
}
