/*
leaflet-boundsawarelayergroup - 1.0.0, Leaflet.LayerGroup plugin to render only layers in the current map bounds
git://github.com/brandoncopeland/Leaflet.boundsAwareLayerGroup.git
(c) 2013 Brandon Copeland <br@ndoncopeland.com>

leaflet-boundsawarelayergroup assumes Leaflet has already been included
*/

(function (L) {

var defaultOptions = {
  makeBoundsAware: false
};

var originalInit = L.LayerGroup.prototype.initialize;

L.LayerGroup.include({
  options: defaultOptions,

  initialize: function (layers, options) {
    L.setOptions(this, options);

    originalInit.call(this, layers);
  },

  addLayer: function (layer) {
    var id = this.getLayerId(layer);
    this._layers[id] = layer;

    if (this._map) {
      if (this.options.makeBoundsAware === true) {
        this._addForBounds([layer], this._map);
      } else {
        this._map.addLayer(layer);
      }
    }

    return this;
  },

  onAdd: function (map) {
    this._map = map;
    if (this.options.makeBoundsAware === true) {
      this._addForBounds(this._layers, map);
      map.on('moveend', function () {
        this._addForBounds(this._layers, map);
      }, this);
    } else {
      this.eachLayer(map.addLayer, map);
    }
  },

  _addForBounds: function (layerArray, map) {
    var mapBounds = map.getBounds(), intersectsMapBounds, layer, i;

    for (i in layerArray) {
      layer = layerArray[i];
      intersectsMapBounds = true; // assume should be rendered by default

      if (typeof layer.getLatLng === 'function') {
        if (!mapBounds.contains(layer.getLatLng())) {
          intersectsMapBounds = false;
        }
      } else if (typeof layer.getBounds === 'function') {
        if (!mapBounds.intersects(layer.getBounds())) {
          intersectsMapBounds = false;
        }
      }

      if (intersectsMapBounds) {
        map.addLayer(layer);
      } else {
        map.removeLayer(layer);
      }
    }
  }
});

L.layerGroup = function (layers, options) {
  return new L.LayerGroup(layers, options);
};

L.featureGroup = function (layers, options) {
  return new L.FeatureGroup(layers, options);
};

}(L));