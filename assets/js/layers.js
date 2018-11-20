/**
 * Get the layers configuartion
 * 
 * @method
 * @return {Promise}
 */
var getLayersConfig = function(lang) {
  var url = API3_URL + '/rest/services/api/MapServer/layersConfig?lang=' + lang;
  return $.getJSON(url);
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
      matrixIds: $.map(resolutions, function(r, i) { return i + ''; })
    });
    var extension = options.format || 'png';
    //var timestamp = options['timestamp'] ? options['timestamp'] : options['timestamps'][0];

    //if(layer == 'ch.bfe.solarenergie-eignung-daecher') {
    //  var timestamp = '20160613';
      //latest timestamp, see http://wmts.geo.admin.ch/1.0.0/WMTSCapabilities.xml, Dimension
    //} else {
      var timestamp = options['timestamp'] ? options['timestamp'] : options['timestamps'][0];
    //}

    return new ol.source.WMTS( /** @type {olx.source.WMTSOptions} */({
      crossOrigin: 'anonymous',
      attributions: [
          new ol.Attribution({html: '<a href="' + options['attributionUrl'] + '" target="new">' +
            options['attribution'] + '</a>'})
      ],
      url: ('http://wmts{5-9}.geo.admin.ch/1.0.0/{Layer}/default/{Time}/21781/' +
          '{TileMatrix}/{TileRow}/{TileCol}.').replace('http:',location.protocol) + extension,
      //url: ('//tod.dev.bgdi.ch/1.0.0/{Layer}/default/{Time}/21781/' +
      //    '{TileMatrix}/{TileRow}/{TileCol}.').replace('http:',location.protocol) + extension,

      //https://tod.dev.bgdi.ch/1.0.0/ch.bfe.solarenergie-eignung-daecher/default/current/2056/27/4081/1669.png

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
//var getWms = function(layer, options) {
//  return new ol.source.TileWMS({
//    crossOrigin: 'anonymous',
//    wrapX: false,
//    gutter: options['gutter'] || 0,
//    attributions: [
//      new ol.Attribution({html: '<a href="' +
//        options['attributionUrl'] +
//        '" target="new">' +
//        options['attribution'] + '</a>'})
//    ],
//    params: {
//      'LAYERS': options['wmsLayers'] || layer,
//      'TIME': options['timestamp']
//    },
//    url: options['wmsUrl'].split('?')[0].replace('http:',location.protocol)
//  });
//};