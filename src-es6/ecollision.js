// Generated by CoffeeScript 2.2.2
var ECollision;

import SimulationEngine from "./engine/simulation-engine.js";

import Simulation from "./ui/simulation.js";

import Graph from "./ui/graph.js";

import Overlay from "./ui/overlay.js";

import ECollisionSettings from "./settings.js";

import EventManager from "./events/event-manager.js";

import Interpolator from "./interpolator.js";

export default ECollision = (function() {
  var setSpeedConst, setUpdateRate;

  class ECollision {
    constructor(settings) {
      this.tick = this.tick.bind(this);
      this.settings = settings;
      this.engine = new SimulationEngine(this.settings.simulation.simulationWidth, this.settings.simulation.simulationHeight, this.settings);
      this.interpol = new Interpolator(this.settings.global.refreshRate, this.settings.global.updateRate);
      this.interpol.lockFPS = true;
      this.widgets = [];
      if (this.settings.simulation.simulationCanvas) {
        this.simulationUI = new Simulation(this.settings.simulation.simulationCanvas, this.engine, this.interpol, this.settings);
        this.widgets.push(this.simulationUI);
      }
      if (this.settings.graph) {
        this.graphUI = new Graph(this.settings.graph.graphCanvas, this.engine, 1 / 50, 5, this.settings);
        this.widgets.push(this.graphUI);
      }
      if (this.settings.overlay) {
        this.overlayUI = new Overlay(this.settings.overlay.overlayCanvas, this.simulationUI, this.interpol, this.settings);
        this.widgets.push(this.overlayUI);
      }
      this.paused = false;
      this.fpsCount = this.fps = this.fpsTime = 0;
      this.updateRate = this.updateTime = this.refreshTime = 0;
      this.interpol.addListener("update", () => {
        if (!this.paused) {
          return this.update();
        }
      }).addListener("render", this.tick);
      this.updateRate = this.settings.global.updateRate;
      this.updateTime = 1000.0 / this.updateRate;
      this.refreshTime = 1000 / this.settings.global.refreshRate;
      EventManager.eventify(this);
    }

    start() {
      var i, len, ref, widget;
      ref = this.widgets;
      for (i = 0, len = ref.length; i < len; i++) {
        widget = ref[i];
        widget.init();
      }
      return this.interpol.start();
    }

    restart() {
      var i, len, ref, results, widget;
      ref = this.widgets;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        widget = ref[i];
        results.push(widget.restart());
      }
      return results;
    }

    resume() {
      var i, len, ref, results, widget;
      this.paused = false;
      ref = this.widgets;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        widget = ref[i];
        results.push(widget.resume());
      }
      return results;
    }

    pause() {
      var i, len, ref, results, widget;
      this.paused = true;
      ref = this.widgets;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        widget = ref[i];
        results.push(widget.pause());
      }
      return results;
    }

    stop() {
      return this.interpol.stop();
    }

    getUpdateRate() {
      return this.updateRate;
    }

    getUpdateTime() {
      return this.updateTime;
    }

    resize() {
      var i, len, ref, results, widget;
      ref = this.widgets;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        widget = ref[i];
        results.push(widget.resize());
      }
      return results;
    }

    update() {
      return this.engine.update();
    }

    tick(interpolation) {
      var i, len, ref, widget;
      this.fpsCurTime = Date.now();
      this.fpsCount++;
      if (this.fpsCurTime - this.fpsTime >= 1000) {
        this.fps = this.fpsCount;
        this.fpsCount = 0;
        this.fpsTime = this.fpsCurTime;
      }
      ref = this.widgets;
      for (i = 0, len = ref.length; i < len; i++) {
        widget = ref[i];
        widget.draw(interpolation);
      }
      return this.fire('tick', [interpolation]);
    }

  };

  setUpdateRate = function(rate) {
    this.updateRate = rate;
    return this.updateTime = 1000.0 / this.updateRate;
  };

  setSpeedConst = function(speedConst) {
    return this.engine.speedConst = speedConst;
  };

  return ECollision;

}).call(this);