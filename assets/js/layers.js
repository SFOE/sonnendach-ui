/**
 * Get the layers configuartion
 * 
 * @method
 * @return {Object}
 */
var getLayersConfig = function() {
    return {
    	"ch.swisstopo.swissimage": {
			"attribution": "CNES, Spot Image, swisstopo, NPOC",
			"background": true,
			"searchable": false,
			"format": "jpeg",
			"hasLegend": false,
			"serverLayerName": "ch.swisstopo.swissimage",
			"selectbyrectangle": false,
			"attributionUrl": "http://www.swisstopo.admin.ch/internet/swisstopo/de/home.html",
			"timeBehaviour": "last",
			"tooltip": false,
			"label": "SWISSIMAGE",
			"highlightable": true,
			"chargeable": true,
			"timestamps": [
				"20151231",
				"20140620",
				"20131107",
				"20130916",
				"20130422",
				"20120809",
				"20120225",
				"20110914",
				"20110228"
			],
			"topics": "api,swissmaponline",
			"resolutions": [
				4000,
				3750,
				3500,
				3250,
				3000,
				2750,
				2500,
				2250,
				2000,
				1750,
				1500,
				1250,
				1000,
				750,
				650,
				500,
				250,
				100,
				50,
				20,
				10,
				5,
				2.5,
				2,
				1.5,
				1,
				0.5,
				0.25
			],
			"type": "wmts",
			"timeEnabled": false,
			"queryable": false
			},
    	"ch.bfe.energiestaedte": {
			"wmsUrl": "https://wms.geo.admin.ch/?REQUEST=GetCapabilities&SERVICE=WMS&VERSION=1.0.0",
			"chargeable": false,
			"searchable": true,
			"serverLayerName": "ch.bfe.energiestaedte",
			"selectbyrectangle": true,
			"highlightable": true,
			"timeEnabled": false,
			"attributionUrl": "http://www.bfe.admin.ch/index.html?lang=de",
			"tooltip": true,
			"label": "Energiestädte",
			"singleTile": false,
			"type": "wms",
			"topics": "api,ech,inspire,wms-bgdi_prod",
			"opacity": 0.6,
			"attribution": "BFE",
			"format": "png",
			"background": false,
			"wmsLayers": "ch.bfe.energiestaedte",
			"gutter": 15,
			"timeBehaviour": "last",
			"hasLegend": true,
			"queryableAttributes": [
				"name"
			],
			"queryable": true
		}
	};
};

/**
 * @const {Array.<number>}
 */
var RESOLUTIONS = [
  4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250,
  1000, 750, 650, 500, 250, 100, 50, 20, 10, 5, 2.5, 2, 1.5, 1, 0.5
];

/**
 * Create a WMTS source given a bod layer id
 * 
 * @method
 * @param {string} layer layer id.
 * @param {Object} options source options.
 * @return {ol.source.WMTS}
 */
var getWmts = function(layer, options) {
    var resolutions = options.resolutions ? options.resolutions : RESOLUTIONS;
    var tileGrid = new ol.tilegrid.WMTS({
      origin: [420000, 350000],
      resolutions: resolutions,
     matrixIds: goog.array.range(resolutions.length)
    });
    var extension = options.format || 'png';
    var timestamp = options['timestamp'] ? options['timestamp'] : options['timestamps'][0];
    return new ol.source.WMTS( /** @type {olx.source.WMTSOptions} */({
      crossOrigin: 'anonymous',
      attributions: [
          new ol.Attribution({html: '<a href="' + options['attributionUrl'] + '" target="new">' +
            options['attribution'] + '</a>'})
      ],
      url: ('http://wmts{5-9}.geo.admin.ch/1.0.0/{Layer}/default/{Time}/21781/' +
          '{TileMatrix}/{TileRow}/{TileCol}.').replace('http:',location.protocol) + extension,
      tileGrid: tileGrid,
      layer: options['serverLayerName'] ? options['serverLayerName'] : layer,
      requestEncoding: 'REST',
      dimensions: {
        'Time': timestamp
      }
    }));
};


/**
 * Create a tiled WMS source given a bod layer id
 * 
 * @method
 * @param {string} layer layer id.
 * @param {Object} options source options.
 * @return {ol.source.TileWMS}
 */
var getWms = function(layer, options) {
  return new ol.source.TileWMS({
    crossOrigin: 'anonymous',
    wrapX: false,
    gutter: options['gutter'] || 0,
    attributions: [
      new ol.Attribution({html: '<a href="' +
        options['attributionUrl'] +
        '" target="new">' +
        options['attribution'] + '</a>'})
    ],
    params: {
      'LAYERS': options['wmsLayers'] || layer,
      'TIME': options['timestamp']
    },
    url: options['wmsUrl'].split('?')[0].replace('http:',location.protocol)
  });
};
