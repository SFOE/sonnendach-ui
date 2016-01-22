/**
 * This function creates the map with all layers, interactions and controls
 *
 * returns an openlayers map
 */
var createMap = function(eltId, lang, nointeraction) {
	
  // Create the layers
  var layers = getLayersConfig(lang);
  var layer1Id = 'ch.swisstopo.swissimage';
  var layer1Config = layers[layer1Id];
  var layer1 = new ol.layer.Tile({
    minResolution: layer1Config.minResolution,
    maxResolution: layer1Config.maxResolution,
    opacity: layer1Config.opacity,
    source: getWmts(layer1Id, layer1Config),
    useInterimTilesOnError: false
  })
  var layer2Id = 'ch.bfe.solarenergie-eignung-daecher';
  var layer2Config = layers[layer2Id];
  var layer2 = new ol.layer.Tile({
    minResolution: layer2Config.minResolution,
    maxResolution: layer2Config.maxResolution,
    opacity: layer2Config.opacity,
    source: getWms(layer2Id, layer2Config),
    useInterimTilesOnError: false
  })

  // Display th highlight of the roof
  var vector = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: [255, 255, 255, 0.4]
      }),
      stroke: new ol.style.Stroke({
        color: [128, 128, 128, 0.8],
        width: 4
      })
    })
  });
	
  // Create a the openlayer map
  var extent = [420000, 30000, 900000, 350000];
  var proj = ol.proj.get('EPSG:21781');
  proj.setExtent(extent);
  var interactions = ol.interaction.defaults();
  if (nointeraction) {
    interactions = ol.interaction.defaults({
      altShiftDragRotate: false,
      doubleClickZoom: false,
      dragPan: false,
      pinchRotate: false,
      pinchZoom: false,
      keyboard: false,
      mouseWheelZoom: false,
      shiftDragZoom: false
    });
  }

  var map = new ol.Map({
    target: eltId,
    layers: [layer1, layer2, vector],
    view: new ol.View({
      resolutions: [
        650, 500, 250, 100, 50, 20, 10, 5, 2.5, 2, 1, 0.5, 0.25, 0.1
      ],
      extent: extent,
      center: ol.extent.getCenter(extent),
      projection: proj,
      zoom: 0
    }),
    controls: ol.control.defaults({
		  attributionOptions: ({
		    collapsible: false
		  })
    }),
    logo: false,
    interactions: interactions
  });
  map.addControl(new ol.control.ScaleLine());
  
  // Change cursor's style when a roof is available
  map.on('pointermove', function(evt) {
    var isHoverLayer = map.forEachLayerAtPixel(evt.pixel, function() {
      return true;
    }, undefined, function(layer) {
      return layer === layer2;
    });
    map.getTargetElement().style.cursor = (isHoverLayer) ? 'pointer' : '';
  });
  return map;
}
