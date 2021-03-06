// Generated by CoffeeScript 2.2.2
var Interpolator;

import EventManager from "./events/event-manager.js";

export default Interpolator = (function() {
  class Interpolator {
    constructor(renderRate, updateRate) {
      this._start = this._start.bind(this);
      this.update = this.update.bind(this);
      this.renderRate = renderRate;
      this.updateRate = updateRate;
      this.lastTime = Date.now();
      this.updateTime = 1000.0 / this.updateRate;
      this.renderTime = 1000.0 / this.renderRate;
      this.updateCatchup = this.updateTime;
      this.maxUpdateCatchup = this.updateTime * 3;
      this.started = false;
      EventManager.eventify(this);
    }

    start() {
      this.started = true;
      return this._start();
    }

    _start() {
      if (this.started) {
        this.update();
        return requestAnimationFrame(this._start);
      }
    }

    stop() {
      return this.started = false;
    }

    static interpolate(startVal, endVal, fraction) {
      return startVal + (fraction * (endVal - startVal));
    }

    setMaxUpdateCatchup(maxUpdateCatchup) {
      return this.maxUpdateCatchup = maxUpdateCatchup;
    }

    update() {
      var delta, t;
      if (this.updateCatchup >= this.updateTime) {
        this.fire("before-update");
        t = 0;
        while (this.updateCatchup >= this.updateTime && t < 7) {
          this.fire("update");
          this.updateCatchup -= this.updateTime;
          t++;
        }
        this.fire("after-update");
      }
      delta = Date.now() - this.lastTime;
      this.updateCatchup += Math.min(delta, this.maxUpdateCatchup);
      this.lastTime += delta;
      this.interpolation = Math.min(1.0, delta / this.updateTime);
      return this.fire("render", [this.interpolation]);
    }

  };

  Interpolator.prototype.interpolation = 0.0;

  Interpolator.prototype.lockFPS = false;

  return Interpolator;

}).call(this);
