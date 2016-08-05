// Generated by CoffeeScript 1.10.0
(function() {
  var EventManager, Interpolator,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  EventManager = require("./events/event-manager");

  module.exports = Interpolator = (function() {
    Interpolator.prototype.interpolation = 0.0;

    Interpolator.prototype.lockFPS = false;

    function Interpolator(renderRate, updateRate) {
      this.renderRate = renderRate;
      this.updateRate = updateRate;
      this.update = bind(this.update, this);
      this.startTime = new Date().getTime();
      this.updateTime = 1000.0 / this.updateRate;
      this.renderTime = 1000.0 / this.renderRate;
      this.curTime = this.lastTime = this.timeStamp = 0;
      this.thread = 0;
      EventManager.eventify(this);
    }

    Interpolator.prototype.start = function() {
      return this.thread = setInterval(this.update, this.updateTime);
    };

    Interpolator.interpolate = function(startVal, endVal, fraction) {
      return startVal + (fraction * (endVal - startVal));
    };

    Interpolator.prototype.update = function() {
      if (this.lockFPS) {
        this.curTime = new Date().getTime() - this.startTime;
      } else {
        this.curTime += this.renderTime;
      }
      if (this.curTime - this.lastTime >= this.updateTime) {
        this.fire("before-update");
        this.timeStamp = this.curTime;
        while (this.curTime - this.lastTime >= this.updateTime) {
          this.fire("update");
          this.lastTime += this.updateTime;
        }
        this.fire("after-update");
      }
      this.interpolation = Math.min(1.0, (this.curTime - this.timeStamp) / this.updateTime);
      return this.fire("render", [this.interpolation]);
    };

    return Interpolator;

  })();

}).call(this);