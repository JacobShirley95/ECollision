// Generated by CoffeeScript 1.10.0
(function() {
  var InterpolationRenderer, Renderer,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Renderer = require("./renderer");

  module.exports = InterpolationRenderer = (function(superClass) {
    extend(InterpolationRenderer, superClass);

    function InterpolationRenderer() {
      this.interpolatables = [];
    }

    InterpolationRenderer.prototype.addInterpolatable = function(interpolatable) {
      return this.interpolatables.push(interpolatable);
    };

    InterpolationRenderer.prototype.removeInterpolatable = function(interpolatable) {
      var i, interpol, j, len, ref, results;
      ref = this.interpolatables;
      results = [];
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        interpol = ref[i];
        if (interpol === interpolatable) {
          interpolatables.splice(i, 1);
          break;
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    InterpolationRenderer.prototype.draw = function(interpolation) {
      var interpol, j, len, ref, results;
      ref = this.interpolatables;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        interpol = ref[j];
        results.push(interpol.interpolate(interpolation));
      }
      return results;
    };

    return InterpolationRenderer;

  })(Renderer);

}).call(this);