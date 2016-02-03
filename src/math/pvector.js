// Generated by CoffeeScript 1.10.0
(function() {
  var PVector;

  module.exports = PVector = (function() {
    function PVector(x, y) {
      this.x = x;
      this.y = y;
    }

    PVector.prototype.getMagnitude = function() {
      return Math.sqrt((this.x * this.x) + (this.y * this.y));
    };

    PVector.prototype.getMagnitudeNS = function() {
      return (this.x * this.x) + (this.y * this.y);
    };

    PVector.prototype.dotProduct = function(vec) {
      return (this.x * vec.x) + (this.y * vec.y);
    };

    PVector.prototype.getNormal = function() {
      return new PVector(-this.y, this.x);
    };

    PVector.prototype.rotate = function(angle) {
      var x2, y2;
      x2 = this.x;
      y2 = this.y;
      this.x = x2 * Math.cos(angle) - y2 * Math.sin(angle);
      return this.y = x2 * Math.sin(angle) + y2 * Math.cos(angle);
    };

    return PVector;

  })();

}).call(this);
