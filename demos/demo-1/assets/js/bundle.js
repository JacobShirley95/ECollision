(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ECollisionSettings = require("../../../../src-js/settings");
var ECollision = require("../../../../src-js/ecollision");

var eCollisionSettings = new ECollisionSettings();
var ecollision = new ECollision(eCollisionSettings);

$.widget("custom.sliderEx", $.ui.slider, {
    _unit:"",
    _amount: null,
    _formatVal: function(val) {
        if (val > 0.09 && val < 1) {
            val = val.toPrecision(2);
        }
        return val+" "+this._unit;
    },
    _slide: function () {
        this._superApply(arguments);

        this._amount.text(this._formatVal(this.options.value));

        var pos = this.handle.position();
        var width = this._amount.width()/2;
        
        var newLeft = pos.left;
        
        this._amount.css("left", newLeft+"px");
    },
    
    _start: function() {
        this._superApply(arguments);
        var left = this.handle.css("left");
        
        this._amount.css('visibility','visible').hide().fadeIn("fast").css("left", left);
    },
    
    _stop: function() {
        this._superApply(arguments);

        this._amount.fadeOut("fast");
    },
    
    _create: function() {
        var min = parseFloat(this.element.attr("min"));
        var max = parseFloat(this.element.attr("max"));
        
        this.options.min = min;
        this.options.max = max;

        this.options.step = parseFloat(this.element.attr("step")) || 1.0;
        
        this.options.value = parseFloat(this.element.attr("value")) || (min+max/2);
        
        var unit = this.element.attr("unit");
        this._unit = unit || "";
        
        this._amount = $('<div class="slider-amount">'+this._formatVal(this.options.value)+'</div>');
        
        this.element.append(this._amount).mousedown(function(event) {
            event.stopPropagation();
        });
        
        this._super();
    }
});

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function toDegrees(ang) {
    var a = ((ang / Math.PI) * 180)+90;
    if (a < 0)
        a += 360;
    else if (a > 360) {
        a -= 360;
    }
    return a;
}

function setCol(text, col) {
    return ("" + text).fontcolor(col);
}

function setColGreen(text) {
    return setCol(text, "green");
}

function dbgBool(bool) {
    if (bool)
        return setCol(""+bool, "green");
    else
        return setCol(""+bool, "red");
}

function log(s) {
    console.log(s);
}

$("#slider-mass").sliderEx({
    slide: function(event, ui) {
        var cp = ecollision.overlayUI.getCurrentParticle() || ecollision.simulationUI.getSelected();
        if (cp != null)
            cp.mass = ui.value;
    }
});
    
$("#slider-cor").sliderEx({
    slide: function(event, ui) {
        var cp = ecollision.overlayUI.getCurrentParticle() || ecollision.simulationUI.getSelected();
        if (cp != null)
            cp.cOR = ui.value;
    }
});

function openAdd() {
    var mode = ecollision.overlayUI.getMode();
    if (mode == 0) {
        ecollision.overlayUI.end();
    } else {
        var mass = $("#slider-mass").sliderEx("value");
        var cOR = $("#slider-cor").sliderEx("value");

        ecollision.overlayUI.beginAdd(mass, cOR, currentColor);
    }
}

function openEdit() {
    var mode = ecollision.overlayUI.getMode();
    if (mode == 1) {
        ecollision.overlayUI.end();
    } else {
        ecollision.overlayUI.beginEdit();
    }
}

$(document).keypress(function(ev) {
    if (ev.charCode == 97) {
        openAdd();
    } else if (ev.charCode == 101) {
        openEdit();
    }
});

$("#add-particle").click(function() {
    openAdd();
});

$("#remove-particle").click(function() {
    openEdit();
});

var currentColor = getRandomColor();

$("#generate-colour").click(function() {
    var cp = ecollision.overlayUI.getCurrentParticle() || ecollision.simulationUI.getSelected();
    if (cp != null) {
        currentColor = getRandomColor();
        cp.style = currentColor;
    }
})

$("#calibrate").click(function() {
    ecollision.graphUI.calibrate();
});

$("#zoom-in").click(function() {
    ecollision.graphUI.zoomIn();
});

$("#zoom-out").click(function() {
    ecollision.graphUI.zoomOut();
});

$("#move-up").click(function() {
    ecollision.graphUI.moveUp();
});

$("#move-down").click(function() {
    ecollision.graphUI.moveDown();
});

$("#btn-sim-data").click(function() {
    eCollisionSettings.global.showVelocities = !eCollisionSettings.global.showVelocities;  
});

$("#btn-run-pause").click(function() {
    if (ecollision.paused)
        ecollision.resume();
    else
        ecollision.pause();

    changeRunPauseBtn();
});

function changeRunPauseBtn() {
    if (!ecollision.paused) {
        $("#btn-run-pause").removeClass('icon-playback-play').addClass('icon-pause').text("PAUSE");
    } else {
        $("#btn-run-pause").removeClass('icon-pause').addClass('icon-playback-play').text("RUN");
    }
}

$("#btn-next").click(function() {
    ecollision.update();
});

var savedState = [];

$("#btn-save").click(function() {
    savedState = [];
    ecollision.simulationUI.saveParticles(savedState);
});

$("#btn-load").click(function() {
    ecollision.simulationUI.loadParticles(savedState);
});

$("#btn-reset").click(function() {
    ecollision.restart();
});

$("#sim-speed-slider").sliderEx({
    slide: function(event, ui) {
        eCollisionSettings.global.speedConst = parseFloat(ui.value);
    }
});

var fpsDiv = $("#fps-div");
var particleInfo = $("#particle-info-box");

ecollision.simulationUI.onSelect = function(particle) {
    $("#slider-mass").sliderEx("value", particle.mass);
    $("#slider-cor").sliderEx("value", particle.cOR);
}

ecollision.onTick = function() {
    if (eCollisionSettings.global.showVelocities) {
        var fps = "";
        if (ecollision.fps < 24) {
            fps = setCol(ecollision.fps, "red");
        } else {
            fps = setCol(ecollision.fps, "green");

        }
        debugStr = "Frame rate: " + fps + " Hz" +
                   "<br /> Update rate: " + setColGreen(ecollision.getUpdateRate()) + " Hz" +
                   "<br /> Energy in system: " + setColGreen(ecollision.graphUI.getEnergy()) + " kJ" +
                   "<br /> Number of particles: " + setColGreen(ecollision.engine.numOfParticles());
                   
        fpsDiv.html(debugStr);
    } else fpsDiv.html("");

    var selected = ecollision.simulationUI.getSelected();
    if (selected != null) {
        var str = "<b>XVel:</b> " + Math.round(selected.xVel*eCollisionSettings.global.updateRate) + " px/s" + 
                  "<br /> <b>YVel:</b> " + Math.round(selected.yVel*eCollisionSettings.global.updateRate) + " px/s" +
                  "<br /> <b>Direction:</b> " + Math.round(toDegrees(Math.atan2(selected.yVel, selected.xVel))) + " degrees" +
                  "<br /> <b>Mass:</b> " + selected.mass + " kg" +
                  "<br /> <b>CoR:</b> " + selected.cOR +
                  "<br /> <b>Radius:</b> " + selected.radius + " px"
                  "<br /> <b>Energy:</b> " + Math.round(selected.getEnergy()) + " J";
        
        particleInfo.html(str);
    } else {
        particleInfo.html("");
    }
}

ecollision.start();
},{"../../../../src-js/ecollision":2,"../../../../src-js/settings":10}],2:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
(function() {
  var ECollision, ECollisionSettings, EventManager, Graph, Interpolator, Overlay, Simulation, SimulationEngine,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  SimulationEngine = require("./engine/simulation-engine");

  Simulation = require("./ui/simulation");

  Graph = require("./ui/graph");

  Overlay = require("./ui/overlay");

  ECollisionSettings = require("./settings");

  EventManager = require("./events/event-manager");

  Interpolator = require("./interpolator");

  module.exports = ECollision = (function() {
    var curTime, fps, fpsCount, fpsTime, newTime, refreshTime, setSpeedConst, setUpdateRate, thread, timeStamp, updateRate, updateTime, widgets;

    widgets = [];

    fpsCount = fps = fpsTime = newTime = timeStamp = curTime = 0;

    thread = -1;

    updateRate = updateTime = refreshTime = 0;

    function ECollision(settings) {
      this.settings = settings;
      this.tick = bind(this.tick, this);
      this.update = bind(this.update, this);
      this.engine = new SimulationEngine(this.settings.simulation.simulationWidth, this.settings.simulation.simulationHeight, this.settings);
      this.interpol = new Interpolator(this.settings.global.refreshRate, this.settings.global.updateRate);
      this.interpol.lockFPS = true;
      this.simulationUI = new Simulation(this.settings.simulation.simulationCanvas, this.engine, this.interpol, this.settings);
      this.graphUI = new Graph(this.settings.graph.graphCanvas, this.engine, 1 / 50, 5, this.settings);
      this.overlayUI = new Overlay(this.settings.overlay.overlayCanvas, this.simulationUI, this.settings);
      this.paused = false;
      this.fps = 0;
      widgets = [this.simulationUI, this.graphUI, this.overlayUI];
      this.interpol.addListener("update", (function(_this) {
        return function() {
          if (!_this.paused) {
            return _this.update();
          }
        };
      })(this)).addListener("render", this.tick);
      updateRate = this.settings.global.updateRate;
      updateTime = 1000.0 / updateRate;
      refreshTime = 1000 / this.settings.global.refreshRate;
      EventManager.eventify(this);
    }

    ECollision.prototype.start = function() {
      var i, len, widget;
      for (i = 0, len = widgets.length; i < len; i++) {
        widget = widgets[i];
        widget.init();
      }
      return this.interpol.start();
    };

    ECollision.prototype.restart = function() {
      var i, len, results, widget;
      results = [];
      for (i = 0, len = widgets.length; i < len; i++) {
        widget = widgets[i];
        results.push(widget.restart());
      }
      return results;
    };

    ECollision.prototype.resume = function() {
      var i, len, results, widget;
      this.paused = false;
      results = [];
      for (i = 0, len = widgets.length; i < len; i++) {
        widget = widgets[i];
        results.push(widget.resume());
      }
      return results;
    };

    ECollision.prototype.pause = function() {
      var i, len, results, widget;
      this.paused = true;
      results = [];
      for (i = 0, len = widgets.length; i < len; i++) {
        widget = widgets[i];
        results.push(widget.pause());
      }
      return results;
    };

    ECollision.prototype.stop = function() {
      if (thread !== -1) {
        clearInterval(thread);
        return thread = -1;
      }
    };

    ECollision.prototype.getUpdateRate = function() {
      return updateRate;
    };

    ECollision.prototype.getUpdateTime = function() {
      return updateTime;
    };

    setUpdateRate = function(rate) {
      updateRate = rate;
      return updateTime = 1000.0 / updateRate;
    };

    setSpeedConst = function(speedConst) {
      return this.engine.speedConst = speedConst;
    };

    ECollision.prototype.update = function() {
      return this.engine.update();
    };

    ECollision.prototype.tick = function(interpolation) {
      var fpsCurTime, i, len, widget;
      fpsCurTime = new Date().getTime();
      fpsCount++;
      if (fpsCurTime - fpsTime >= 1000) {
        this.fps = fpsCount;
        fpsCount = 0;
        fpsTime = fpsCurTime;
      }
      for (i = 0, len = widgets.length; i < len; i++) {
        widget = widgets[i];
        widget.draw(interpolation);
      }
      return this.fire('tick', [interpolation]);
    };

    return ECollision;

  })();

}).call(this);

},{"./engine/simulation-engine":3,"./events/event-manager":4,"./interpolator":5,"./settings":10,"./ui/graph":11,"./ui/overlay":12,"./ui/simulation":17}],3:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
(function() {
  var EventManager, PVector, Particle, SimulationEngine;

  Particle = require('../objects/particle');

  PVector = require('../math/pvector');

  EventManager = require('../events/event-manager');

  module.exports = SimulationEngine = (function() {
    var Collision, splitVelocity;

    SimulationEngine.prototype.particles = [];

    function SimulationEngine(width, height, settings) {
      this.width = width;
      this.height = height;
      this.settings = settings;
      EventManager.eventify(this);
    }

    SimulationEngine.prototype.setBounds = function(width, height) {
      this.width = width;
      this.height = height;
    };

    SimulationEngine.prototype.reset = function() {
      return this.particles = [];
    };

    Collision = (function() {
      function Collision() {}

      Collision.prototype.time = 0.0;

      Collision.prototype.particle = null;

      Collision.prototype.particle2 = null;

      return Collision;

    })();

    SimulationEngine.prototype.edgeCollision = function(particle, rebound) {
      var cOR;
      cOR = particle.cOR;
      if (particle.x + particle.radius >= this.width) {
        if (rebound) {
          particle.xVel *= -cOR;
          particle.yVel *= cOR;
        } else {
          particle.x = this.width - particle.radius;
        }
      } else if (particle.x - particle.radius <= 0) {
        if (rebound) {
          particle.xVel *= -cOR;
          particle.yVel *= cOR;
        } else {
          particle.x = particle.radius;
        }
      }
      if (particle.y + particle.radius >= this.height) {
        if (rebound) {
          particle.xVel *= cOR;
          return particle.yVel *= -cOR;
        } else {
          return particle.y = this.height - particle.radius;
        }
      } else if (particle.y - particle.radius <= 0) {
        if (rebound) {
          particle.xVel *= cOR;
          return particle.yVel *= -cOR;
        } else {
          return particle.y = particle.radius;
        }
      }
    };

    SimulationEngine.prototype.collide = function(particle, particle2, collision) {
      var a, b, c, dX, dY, discr, pDiff, r, sqr, t, t2, vDiff;
      dX = particle2.x - particle.x;
      dY = particle2.y - particle.y;
      sqr = (dX * dX) + (dY * dY);
      r = particle2.radius + particle.radius;
      this.fire("check-collision", [particle, particle2, sqr]);
      if (sqr < r * r) {
        pDiff = new PVector(particle.x - particle2.x, particle.y - particle2.y);
        vDiff = new PVector(particle.xVel - particle2.xVel, particle.yVel - particle2.yVel);
        a = vDiff.dotProduct(vDiff);
        b = -2 * vDiff.dotProduct(pDiff);
        c = (pDiff.dotProduct(pDiff)) - (r * r);
        discr = (b * b) - (4 * a * c);
        t = 0.0;
        t2 = 0.0;
        if (discr >= 0) {
          t = (-b - Math.sqrt(discr)) / (2 * a);
          t2 = (-b + Math.sqrt(discr)) / (2 * a);
        }
        if (t > 0.0 && t <= 1.0) {
          collision.time = t;
        } else if (t2 > 0.0 && t2 <= 1.0) {
          collision.time = t2;
        } else {
          collision.time = 1.0;
        }
        return true;
      }
      return false;
    };

    splitVelocity = function(particle1, particle2) {
      var a, ang, dx, dy, magnitude, velocity;
      velocity = new PVector(particle1.xVel, particle1.yVel);
      a = Math.PI / 2;
      if (particle1.xVel !== 0) {
        a = Math.atan(particle1.yVel / particle1.xVel);
      }
      magnitude = (particle1.xVel * Math.cos(-a) - particle1.yVel * Math.sin(-a)) * particle1.cOR;
      dx = particle1.x - particle2.x;
      dy = particle1.y - particle2.y;
      ang = 0;
      if (dx !== 0) {
        ang = Math.atan(dy / dx);
      } else {
        ang = Math.atan(dy / (dx - 0.00001));
      }
      velocity.x = magnitude * (Math.cos(ang - a));
      velocity.y = magnitude * (Math.sin(ang - a));
      return velocity;
    };

    SimulationEngine.prototype.handleCollision = function(collision) {
      var ang, cosA, newV, newV2, particle, particle2, particleVel, sinA, thisVel, x1, x2, y1, y2;
      particle = collision.particle;
      particle2 = collision.particle2;
      thisVel = splitVelocity(particle, particle2);
      particleVel = splitVelocity(particle2, particle);
      newV = ((thisVel.x * (particle.mass - particle2.mass)) + (2 * particle2.mass * particleVel.x)) / (particle.mass + particle2.mass);
      newV2 = ((particleVel.x * (particle2.mass - particle.mass)) + (2 * particle.mass * thisVel.x)) / (particle.mass + particle2.mass);
      ang = Math.atan((particle.y - particle2.y) / (particle.x - particle2.x));
      cosA = Math.cos(ang);
      sinA = Math.sin(ang);
      x1 = (newV * cosA) + (thisVel.y * sinA);
      y1 = (newV * sinA) - (thisVel.y * cosA);
      x2 = (newV2 * cosA) + (particleVel.y * sinA);
      y2 = (newV2 * sinA) - (particleVel.y * cosA);
      this.seperateObjects(collision, particle, particle2);
      particle.xVel = x1;
      particle.yVel = y1;
      particle2.xVel = x2;
      return particle2.yVel = y2;
    };

    SimulationEngine.prototype.seperateObjects = function(collision, particle, particle2) {
      var ang, dX, dY, i, overlap, sqr, t, vT, vel1, vel2;
      t = collision.time + (0.001 * collision.time);
      if (t < 1.0) {
        particle.x -= particle.xVel * this.settings.global.speedConst * t;
        particle.y -= particle.yVel * this.settings.global.speedConst * t;
        particle2.x -= particle2.xVel * this.settings.global.speedConst * t;
        return particle2.y -= particle2.yVel * this.settings.global.speedConst * t;
      } else {
        dX = particle2.x - particle.x;
        dY = particle2.y - particle.y;
        sqr = (dX * dX) + (dY * dY);
        overlap = particle2.radius - Math.abs(Math.sqrt(sqr) - particle.radius) + 0.1;
        vel1 = new PVector(particle.xVel, particle.yVel).getMagnitudeNS() + 0.0001;
        vel2 = new PVector(particle2.xVel, particle2.yVel).getMagnitudeNS() + 0.0001;
        vT = vel1 + vel2;
        i = vel1 / vT;
        ang = Math.atan2(particle.y - particle2.y, particle.x - particle2.x);
        particle.x += overlap * Math.cos(ang) * i;
        particle.y += overlap * Math.sin(ang) * i;
        i = 1 - i;
        particle2.x -= overlap * Math.cos(ang) * i;
        return particle2.y -= overlap * Math.sin(ang) * i;
      }
    };

    SimulationEngine.prototype.update = function() {
      var colObjects, collision, i, i2, j, k, l, len, len1, len2, len3, m, n, particle, particle2, ref, ref1, ref2, ref3, ref4;
      ref = this.particles;
      for (j = 0, len = ref.length; j < len; j++) {
        particle = ref[j];
        this.edgeCollision(particle, true);
        particle.update();
      }
      colObjects = [];
      ref1 = this.particles;
      for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
        particle = ref1[i];
        for (i2 = l = ref2 = i + 1, ref3 = this.particles.length - 1; l <= ref3; i2 = l += 1) {
          particle2 = this.particles[i2];
          collision = new Collision();
          if (this.collide(particle, particle2, collision)) {
            collision.particle = particle;
            collision.particle2 = particle2;
            colObjects.push(collision);
          }
        }
      }
      colObjects.sort(function(a, b) {
        return a.time < b.time;
      });
      for (m = 0, len2 = colObjects.length; m < len2; m++) {
        collision = colObjects[m];
        this.handleCollision(collision);
      }
      ref4 = this.particles;
      for (n = 0, len3 = ref4.length; n < len3; n++) {
        particle = ref4[n];
        this.edgeCollision(particle, false);
      }
      return this.fire("update");
    };

    return SimulationEngine;

  })();

}).call(this);

},{"../events/event-manager":4,"../math/pvector":7,"../objects/particle":8}],4:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0

/* EventManager, v1.0.1
*
* Copyright (c) 2009, Howard Rauscher
* Licensed under the MIT License
 */

(function() {
  var EventManager;

  module.exports = EventManager = (function() {
    var EventArg;

    EventArg = (function() {
      function EventArg(name1, data1) {
        this.name = name1;
        this.data = data1;
        this.cancelled = false;
        this.removed = false;
      }

      EventArg.prototype.cancel = function() {
        return this.cancelled = true;
      };

      EventArg.prototype.remove = function() {
        return this.removed = true;
      };

      return EventArg;

    })();

    function EventManager() {
      this._listeners = [];
    }

    EventManager.prototype.addListener = function(name, fn) {
      (this._listeners[name] = this._listeners[name] || []).push(fn);
      return this;
    };

    EventManager.prototype.removeListener = function(name, fn) {
      var foundAt, i, j, len1, listener, listeners;
      if (arguments.length === 1) {
        this._listeners[name] = [];
      } else if (typeof fn === 'function') {
        listeners = this._listeners[name];
        if (listeners !== void 0) {
          foundAt = -1;
          for (i = j = 0, len1 = listeners.length; j < len1; i = ++j) {
            listener = listeners[i];
            if (listener === fn) {
              foundAt = i;
              break;
            }
          }
          if (foundAt >= 0) {
            listeners.splice(foundAt, 1);
          }
        }
      }
      return this;
    };

    EventManager.prototype.fire = function(name, args) {
      var data, evt, i, j, len, len1, listener, listeners;
      listeners = this._listeners[name];
      args = args || [];
      if (listeners !== void 0) {
        data = {};
        evt = null;
        for (i = j = 0, len1 = listeners.length; j < len1; i = ++j) {
          listener = listeners[i];
          evt = new EventArg(name, data);
          listener.apply(window, args.concat(evt));
          data = evt.data;
          if (evt.removed) {
            listeners.splice(i, 1);
            len = listeners.length;
            --i;
          }
          if (evt.cancelled) {
            break;
          }
        }
      }
      return this;
    };

    EventManager.prototype.hasListeners = function(name) {
      var ref;
      return ((ref = this._listeners[name] === void 0) != null ? ref : {
        0: this._listeners[name].length
      }) > 0;
    };

    EventManager.eventify = function(object, manager) {
      var func, j, len1, method, methods, results;
      methods = ['addListener', 'removeListener', 'fire'];
      manager = manager || new EventManager();
      func = function(method) {
        return object[method] = function() {
          return manager[method].apply(manager, arguments);
        };
      };
      results = [];
      for (j = 0, len1 = methods.length; j < len1; j++) {
        method = methods[j];
        results.push(func(method));
      }
      return results;
    };

    return EventManager;

  })();

}).call(this);

},{}],5:[function(require,module,exports){
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

},{"./events/event-manager":4}],6:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
(function() {
  var Point2D;

  module.exports = Point2D = (function() {
    function Point2D(x, y) {
      this.x = x;
      this.y = y;
    }

    return Point2D;

  })();

}).call(this);

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
(function() {
  var Particle, PhysicsObject, Point2D,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  PhysicsObject = require('./physics-object');

  Point2D = require('../math/point-2d');

  module.exports = Particle = (function(superClass) {
    extend(Particle, superClass);

    Particle.prototype.selected = false;

    Particle.prototype.cOR = 1.0;

    Particle.prototype.pastPositions = [];

    Particle.prototype.curPos = 0;

    Particle.prototype.renderer = null;

    function Particle(x, y, radius, style, settings) {
      this.radius = radius;
      this.style = style;
      this.settings = settings;
      Particle.__super__.constructor.call(this, x, y, 0);
    }

    Particle.prototype.update = function() {
      this.x += this.xVel * this.settings.global.speedConst;
      return this.y += this.yVel * this.settings.global.speedConst;
    };

    Particle.prototype.copy = function() {
      var p;
      p = new Particle(this.x, this.y, this.radius, this.style, this.settings);
      p.index = this.index;
      p.cOR = this.cOR;
      p.mass = this.mass;
      p.xVel = this.xVel;
      p.yVel = this.yVel;
      return p;
    };

    return Particle;

  })(PhysicsObject);

}).call(this);

},{"../math/point-2d":6,"./physics-object":9}],9:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
(function() {
  var EventManager, PhysicsObject;

  EventManager = require("../events/event-manager");

  module.exports = PhysicsObject = (function() {
    PhysicsObject.prototype.xVel = 0;

    PhysicsObject.prototype.yVel = 0;

    function PhysicsObject(x, y, mass) {
      this.x = x;
      this.y = y;
      this.mass = mass;
      this.lastX = this.x;
      this.lastY = this.y;
      EventManager.eventify(this);
    }

    PhysicsObject.prototype.capture = function() {
      this.lastX = this.x;
      return this.lastY = this.y;
    };

    PhysicsObject.prototype.update = function() {
      this.x += this.xVel;
      return this.y += this.yVel;
    };

    PhysicsObject.prototype.getEnergy = function() {
      return 0.5 * this.mass * ((this.xVel * this.xVel) + (this.yVel * this.yVel));
    };

    return PhysicsObject;

  })();

}).call(this);

},{"../events/event-manager":4}],10:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
(function() {
  var ECollisionSettings;

  module.exports = ECollisionSettings = (function() {
    function ECollisionSettings() {}

    ECollisionSettings.prototype.global = {
      refreshRate: 24,
      updateRate: 60,
      showVelocities: false,
      enableInterpolation: true,
      maxTraceLength: 30,
      speedConst: 1.0,
      maxParticles: 10000,
      minRadius: 5,
      maxRadius: 30,
      errorTime: 5000
    };

    ECollisionSettings.prototype.simulation = {
      simulationWidth: 1000,
      simulationHeight: 1000,
      simulationCanvas: "simulation-canvas",
      enableSelection: true
    };

    ECollisionSettings.prototype.graph = {
      graphCanvas: "graph-canvas",
      graphScaleX: 1 / 50,
      graphScaleY: 5,
      graphZoomFactor: 1.25,
      graphMinZoomIndex: 5,
      graphMaxZoomIndex: 5
    };

    ECollisionSettings.prototype.overlay = {
      overlayCanvas: "overlay-canvas"
    };

    return ECollisionSettings;

  })();

}).call(this);

},{}],11:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
(function() {
  var Graph, Particle, Point2D, Widget,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Widget = require("./widget");

  Particle = require('../objects/particle');

  Point2D = require('../math/point-2d');

  module.exports = Graph = (function(superClass) {
    var currX, currY, data, graph, maxLen, offsetX, offsetY, start, updated, userY, zoomIndex;

    extend(Graph, superClass);

    Graph.prototype.x = 0;

    Graph.prototype.y = 0;

    Graph.prototype.scaleX = 0;

    Graph.prototype.scaleY = 0;

    graph = new createjs.Shape();

    offsetX = 0.0;

    offsetY = 0.0;

    userY = 0;

    data = [];

    start = 0;

    maxLen = 150;

    updated = false;

    currX = 0;

    currY = 0;

    zoomIndex = 0;

    function Graph(canvasName, engine, scaleX, scaleY, settings) {
      this.engine = engine;
      this.scaleX = scaleX;
      this.scaleY = scaleY;
      this.settings = settings;
      Graph.__super__.constructor.call(this, canvasName);
    }

    Graph.prototype.init = function() {
      var xAxis, yAxis;
      xAxis = new createjs.Shape();
      yAxis = new createjs.Shape();
      xAxis.graphics.beginStroke("red").moveTo(this.x, this.height).lineTo(this.width, this.height);
      yAxis.graphics.beginStroke("red").moveTo(this.x, this.y).lineTo(this.x, this.height);
      this.stage.addChild(xAxis);
      this.stage.addChild(yAxis);
      this.stage.addChild(graph);
      this.stage.update();
      return this.updateData();
    };

    Graph.prototype.draw = function(interpolation) {
      var dataY, g, i, i2, j, length, targetY, total, x1, x2, x3, y1, y2, y3;
      if (this.engine !== null) {
        g = graph.graphics;
        g.clear();
        length = data.length - 1;
        total = 0;
        j = 0;
        while (j < length - 1) {
          if (updated) {
            updated = false;
            return;
          }
          total += data[j].y;
          i = (start + j) % length;
          i2 = (start + j + 1) % length;
          x2 = (data[i].x * this.scaleX) - offsetX;
          y2 = (data[i].y * this.scaleY) + offsetY + userY;
          if (x2 > this.width) {
            offsetX += x2 - this.width;
          }
          x1 = (data[i].x * this.scaleX) - offsetX;
          y1 = (data[i].y * this.scaleY) + offsetY + userY;
          x3 = (data[i2].x * this.scaleX) - offsetX;
          y3 = (data[i2].y * this.scaleY) + offsetY + userY;
          g.beginStroke("red").moveTo(this.x + x1, this.y + this.height - y1).lineTo(this.x + x3, this.y + this.height - y3);
          j++;
        }
        if (!this.paused) {
          currX += 1000 / this.settings.global.updateRate;
          currY = this.getEnergy();
          this.addData(currX, currY);
        }
        dataY = total / data.length;
        targetY = this.height / 2;
        offsetY = targetY - (dataY * this.scaleY);
        return this.stage.update();
      }
    };

    Graph.prototype.restart = function() {
      data = [];
      start = 0;
      currX = currY = 0;
      offsetX = offsetY = 0;
      return updated = true;
    };

    Graph.prototype.calibrate = function() {
      return userY = 0;
    };

    Graph.prototype.zoomIn = function() {
      if (zoomIndex < this.settings.graph.graphMaxZoomIndex) {
        this.scaleX *= this.settings.graph.graphZoomFactor;
        this.scaleY *= this.settings.graph.graphZoomFactor;
        offsetX *= this.scaleX;
        offsetY *= this.scaleY;
        this.updateData();
        return zoomIndex++;
      } else {
        throw "ERROR: Maximum zoom reached";
      }
    };

    Graph.prototype.zoomOut = function() {
      if (zoomIndex > -this.settings.graph.graphMinZoomIndex) {
        this.scaleX /= this.settings.graph.graphZoomFactor;
        this.scaleY /= this.settings.graph.graphZoomFactor;
        offsetX *= this.scaleX;
        offsetY *= this.scaleY;
        this.updateData();
        return zoomIndex--;
      } else {
        throw "ERROR: Minimum zoom reached";
      }
    };

    Graph.prototype.moveUp = function() {
      return userY -= 5;
    };

    Graph.prototype.moveDown = function() {
      return userY += 5;
    };

    Graph.prototype.getZoomIndex = function() {
      return zoomIndex;
    };

    Graph.prototype.addData = function(x, y) {
      var s;
      if (data.length > maxLen) {
        s = start;
        start = (start + 1) % maxLen;
        return data[s] = new Point2D(x, y);
      } else {
        return data.push(new Point2D(x, y));
      }
    };

    Graph.prototype.updateData = function() {
      var aLen, data2, diff, i, j, k, ref, ref1;
      data2 = [];
      maxLen = Math.round(this.width / ((1000 / this.settings.global.updateRate) * this.scaleX)) + 5;
      aLen = data.length - 1;
      diff = 0;
      if (aLen > maxLen) {
        diff = aLen - maxLen;
      }
      for (j = k = ref = diff, ref1 = aLen - 1; k <= ref1; j = k += 1) {
        i = (start + j) % aLen;
        data2.push(data[i]);
      }
      updated = true;
      start = 0;
      return data = data2;
    };

    Graph.prototype.getEnergy = function() {
      var energy, k, len, particle, ref;
      energy = 0.0;
      ref = this.engine.particles;
      for (k = 0, len = ref.length; k < len; k++) {
        particle = ref[k];
        energy += particle.getEnergy();
      }
      return Math.round(energy / 1000);
    };

    return Graph;

  })(Widget);

}).call(this);

},{"../math/point-2d":6,"../objects/particle":8,"./widget":18}],12:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
(function() {
  var Overlay, Particle, Widget,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Widget = require("./widget");

  Particle = require("../objects/particle");

  module.exports = Overlay = (function(superClass) {
    var INDEX_MODIFY, INDEX_PLACE, INDEX_VELOCITY, MODE_ADD, MODE_EDIT, copyPlace, crossX, crossY, errorText, errorTimer, freePlace, gcd, index, infoText, interval, lastX, lastY, mode, modeText, mouseX, mouseY, showError, tempObject, velocityLine;

    extend(Overlay, superClass);

    INDEX_PLACE = 0;

    INDEX_VELOCITY = 1;

    INDEX_MODIFY = 2;

    MODE_ADD = 0;

    MODE_EDIT = 1;

    Overlay.prototype.particleRenderer = null;

    index = 0;

    mode = -1;

    mouseX = crossX = 0;

    mouseY = crossY = 0;

    velocityLine = new createjs.Shape();

    infoText = new createjs.Text("", "bold 15px Arial");

    errorText = new createjs.Text("", "bold 15px Arial", "red");

    errorTimer = 0;

    showError = false;

    modeText = new createjs.Text("", "bold 15px Arial");

    modeText.x = 0;

    modeText.y = 10;

    freePlace = false;

    copyPlace = false;

    lastX = 0;

    lastY = 0;

    tempObject = null;

    interval = 0;

    function Overlay(canvasName, simulation, settings) {
      this.simulation = simulation;
      this.settings = settings;
      this.handleClick = bind(this.handleClick, this);
      this.handleMouseMove = bind(this.handleMouseMove, this);
      this.handleMouseWheel = bind(this.handleMouseWheel, this);
      Overlay.__super__.constructor.call(this, canvasName);
      mouseX = crossX = this.width / 2;
      mouseY = crossY = this.height / 2;
      modeText.x = (this.width / 2) - 40;
      interval = gcd(this.width, this.height);
      this.hide();
      $(document).keydown(function(event) {
        freePlace = event.ctrlKey;
        return copyPlace = event.shiftKey;
      });
      $(document).keyup(function(event) {
        freePlace = false;
        return copyPlace = false;
      });
      this.canvas.bind('contextmenu', function(e) {
        return false;
      });
      mouseX = crossX = this.width / 2;
      mouseY = crossY = this.height / 2;
      this.stage.addEventListener("stagemousemove", this.handleMouseMove);
      this.canvas.mousedown(this.handleClick);
      this.canvas.mousewheel(this.handleMouseWheel);
    }

    gcd = function(a, b) {
      if (!b) {
        return a;
      }
      return gcd(b, a % b);
    };

    Overlay.prototype.resize = function(width, height) {
      return interval = gcd(this.width, this.height);
    };

    Overlay.prototype.init = function() {
      this.stage.removeAllChildren();
      this.simulation.renderer.removeParticle(tempObject);
      mouseX = crossX = this.width / 2;
      mouseY = crossY = this.height / 2;
      return this.stage.addChild(modeText);
    };

    Overlay.prototype.handleMouseWheel = function(ev) {
      var d;
      d = ev.deltaY;
      if (d < 0) {
        if (tempObject.radius > this.settings.global.minRadius) {
          return tempObject.radius -= 1;
        }
      } else {
        if (tempObject.radius < this.settings.global.maxRadius) {
          return tempObject.radius += 1;
        }
      }
    };

    Overlay.prototype.handleMouseMove = function(ev) {
      var dx, dy, g, gridX, gridY, i, len, p, ref, results;
      mouseX = crossX = ev.stageX;
      mouseY = crossY = ev.stageY;
      if (!freePlace) {
        gridX = Math.round(mouseX / interval);
        gridY = Math.round(mouseY / interval);
        crossX = gridX * interval;
        crossY = gridY * interval;
      }
      switch (index) {
        case INDEX_PLACE:
          velocityLine.x = crossX;
          velocityLine.y = crossY;
          if (tempObject !== null) {
            tempObject.x = crossX;
            tempObject.y = crossY;
          }
          infoText.x = crossX;
          infoText.y = crossY;
          break;
        case INDEX_VELOCITY:
          g = velocityLine.graphics;
          dx = crossX - velocityLine.x;
          dy = crossY - velocityLine.y;
          infoText.x = velocityLine.x + (dx / 2);
          infoText.y = velocityLine.y + (dy / 2);
          infoText.text = Math.round(Math.sqrt(dx * dx + dy * dy)) + " px/s";
          tempObject.xVel = dx / this.settings.global.updateRate;
          tempObject.yVel = dy / this.settings.global.updateRate;
          g.clear().beginStroke("red").setStrokeStyle(3).moveTo(0, 0).lineTo(dx, dy);
          break;
        case INDEX_MODIFY:
          ref = this.simulation.renderer.getParticles();
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            p = ref[i];
            if (this.simulation.renderer.isParticleAtPos(p, mouseX, mouseY)) {
              results.push(p.select());
            } else {
              results.push(p.deselect());
            }
          }
          return results;
      }
    };

    Overlay.prototype.handleClick = function(ev) {
      var p, possibles, selected;
      if (ev.button === 2 && index !== INDEX_MODIFY) {
        switch (index) {
          case INDEX_PLACE:
            this.end();
            break;
          case INDEX_VELOCITY:
            break;
        }
        this.reset();
      } else {
        switch (index) {
          case INDEX_PLACE:
            velocityLine.graphics.clear();
            this.stage.addChild(velocityLine);
            this.stage.addChild(infoText);
            index = INDEX_VELOCITY;
            break;
          case INDEX_VELOCITY:
            p = this.simulation.addParticle(tempObject.x, tempObject.y, tempObject.mass, tempObject.radius, tempObject.style);
            p.xVel = tempObject.xVel;
            p.yVel = tempObject.yVel;
            p.cOR = tempObject.cOR;
            this.stage.removeChild(velocityLine);
            this.stage.removeChild(infoText);
            tempObject.xVel = tempObject.yVel = 0;
            if (mode === MODE_EDIT && !copyPlace) {
              index = INDEX_MODIFY;
              this.simulation.renderer.removeParticle(tempObject);
            } else {
              index = INDEX_PLACE;
            }
            break;
          case INDEX_MODIFY:
            possibles = this.simulation.renderer.getParticlesAtPos(mouseX, mouseY);
            if (possibles.length > 0) {
              selected = possibles[0].particle;
              this.simulation.removeParticle(selected);
              if (ev.button !== 2) {
                tempObject = selected.copy();
                lastX = selected.x;
                lastY = selected.y;
                this.particleRenderer = this.simulation.renderer.addParticle(tempObject);
                if (!copyPlace) {
                  this.simulation.removeSelected();
                }
                index = INDEX_PLACE;
              }
            }
            break;
        }
      }
      return ev.stopPropagation();
    };

    Overlay.prototype.draw = function(interpolation) {
      if (!this.hidden) {
        if (showError) {
          errorTimer -= 1000 / this.settings.global.updateRate;
          if (errorTimer <= 0) {
            showError = false;
            this.stage.removeChild(errorText);
          }
        }
        return this.stage.update();
      }
    };

    Overlay.prototype.reset = function() {
      if (mode === MODE_EDIT) {
        console.log("LOL");
      }
      this.stage.removeChild(velocityLine);
      this.stage.removeChild(infoText);
      return index = INDEX_PLACE;
    };

    Overlay.prototype.beginAdd = function(mass, cOR, style) {
      this.show();
      this.init();
      tempObject = new Particle(crossX, crossY, 25, style, this.settings);
      tempObject.mass = mass;
      tempObject.cOR = cOR;
      this.particleRenderer = this.simulation.renderer.addParticle(tempObject);
      infoText.x = mouseX;
      infoText.y = mouseY;
      modeText.text = "Mode: Add";
      index = INDEX_PLACE;
      return mode = MODE_ADD;
    };

    Overlay.prototype.beginEdit = function() {
      this.show();
      this.init();
      modeText.text = "Mode: Edit";
      index = INDEX_MODIFY;
      return mode = MODE_EDIT;
    };

    Overlay.prototype.end = function() {
      this.hide();
      this.simulation.renderer.removeParticle(tempObject);
      tempObject = null;
      mode = -1;
      freePlace = false;
      return copyPlace = false;
    };

    Overlay.prototype.getCurrentParticle = function() {
      return tempObject;
    };

    Overlay.prototype.getMode = function() {
      return mode;
    };

    return Overlay;

  })(Widget);

}).call(this);

},{"../objects/particle":8,"./widget":18}],13:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
(function() {
  var EaselJSRenderer, ParticleRenderer, SimulationRenderer,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ParticleRenderer = require('./particle-renderer');

  SimulationRenderer = require('../simulation-renderer');

  module.exports = EaselJSRenderer = (function(superClass) {
    extend(EaselJSRenderer, superClass);

    function EaselJSRenderer(canvasName, interpolator, settings) {
      this.canvasName = canvasName;
      this.interpolator = interpolator;
      this.settings = settings;
      EaselJSRenderer.__super__.constructor.call(this, this.canvasName, this.interpolator);
      this.stage = new createjs.Stage(this.canvasName);
      this.renderObjs = [];
      this.interpolator.addListener("before-update", (function(_this) {
        return function() {
          var j, len, particle, ref, results;
          ref = _this.renderObjs;
          results = [];
          for (j = 0, len = ref.length; j < len; j++) {
            particle = ref[j];
            results.push(particle.capture());
          }
          return results;
        };
      })(this));
    }

    EaselJSRenderer.prototype.addParticle = function(particle) {
      var pr;
      pr = new ParticleRenderer(particle, this.settings.simulation.enableSelection);
      particle.renderer = pr;
      this.stage.addChild(pr.displayObj);
      this.renderObjs.push(pr);
      return pr;
    };

    EaselJSRenderer.prototype.getParticlesAtPos = function(x, y) {
      var j, len, list, ref, renderable;
      list = [];
      ref = this.renderObjs;
      for (j = 0, len = ref.length; j < len; j++) {
        renderable = ref[j];
        if (this.isParticleAtPos(renderable, x, y)) {
          list.push(renderable);
        }
      }
      return list;
    };

    EaselJSRenderer.prototype.isParticleAtPos = function(particle, x, y) {
      var dx, dy, p;
      p = particle.particle;
      dx = p.x - x;
      dy = p.y - y;
      if (dx * dx + dy * dy <= p.radius * p.radius) {
        return true;
      }
      return false;
    };

    EaselJSRenderer.prototype.removeParticles = function(particles) {};

    EaselJSRenderer.prototype.removeParticle = function(particle) {
      var i, j, len, p, ref, results;
      ref = this.renderObjs;
      results = [];
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        p = ref[i];
        if (particle === p.particle) {
          particle.renderer = null;
          this.stage.removeChild(p.displayObj);
          this.renderObjs.splice(i, 1);
          break;
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    EaselJSRenderer.prototype.getParticles = function() {
      return this.renderObjs;
    };

    EaselJSRenderer.prototype.clear = function() {
      var j, len, p, ref;
      ref = this.renderObjs;
      for (j = 0, len = ref.length; j < len; j++) {
        p = ref[j];
        this.stage.removeChild(p.displayObj);
        p.particle = null;
      }
      return this.renderObjs = [];
    };

    EaselJSRenderer.prototype.draw = function(interpolation) {
      var j, len, particle, ref;
      ref = this.renderObjs;
      for (j = 0, len = ref.length; j < len; j++) {
        particle = ref[j];
        particle.draw(interpolation);
      }
      return this.stage.update();
    };

    return EaselJSRenderer;

  })(SimulationRenderer);

}).call(this);

},{"../simulation-renderer":16,"./particle-renderer":14}],14:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
(function() {
  var EventManager, Interpolator, ParticleRenderer, Point2D, Renderer,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Renderer = require("../renderer");

  Point2D = require("../../../math/point-2d");

  EventManager = require("../../../events/event-manager");

  Interpolator = require("../../../interpolator");

  module.exports = ParticleRenderer = (function(superClass) {
    var curPos, len, pastPositions;

    extend(ParticleRenderer, superClass);

    pastPositions = [];

    curPos = 0;

    function ParticleRenderer(particle, enableSelection) {
      this.particle = particle;
      this.enableSelection = enableSelection;
      this.displayObj = new createjs.Shape();
      this.lastX = this.particle.x;
      this.lastY = this.particle.y;
      this.selected = false;
      this.displayObj.x = this.particle.x;
      this.displayObj.y = this.particle.y;
      this.displayObj.addEventListener("click", (function(_this) {
        return function(ev) {
          if (_this.selected) {
            _this.fire("deselect", [ev, _this]);
            return _this.deselect();
          } else {
            _this.fire("select", [ev, _this]);
            return _this.select();
          }
        };
      })(this));
      this.tail = new createjs.Shape();
      this.tail.x = this.particle.x;
      this.tail.y = this.particle.y;
      EventManager.eventify(this);
    }

    ParticleRenderer.prototype.capture = function() {
      this.lastX = this.particle.x;
      return this.lastY = this.particle.y;
    };

    if (ParticleRenderer.enableSelection && ParticleRenderer.selected) {
      curPos++;
      curPos %= 20;
      len = pastPositions.length;
      if (len < 20) {
        pastPositions.push(new Point2D(ParticleRenderer.x, ParticleRenderer.y));
      } else {
        pastPositions[curPos] = new Point2D(ParticleRenderer.x, ParticleRenderer.y);
      }
    }

    ParticleRenderer.prototype.select = function() {
      return this.selected = true;
    };

    ParticleRenderer.prototype.deselect = function() {
      this.selected = false;
      return pastPositions = [];
    };

    ParticleRenderer.prototype.draw = function(interpolation) {
      var col, graphics, i, j, newX, newY, p, px, py, r_a, ref;
      newX = this.particle.x;
      newY = this.particle.y;
      if (interpolation > 0.0) {
        newX = Interpolator.interpolate(this.lastX, newX, interpolation);
        newY = Interpolator.interpolate(this.lastY, newY, interpolation);
      }
      this.displayObj.x = newX;
      this.displayObj.y = newY;
      graphics = this.displayObj.graphics;
      graphics.clear().beginFill(this.particle.style).drawCircle(0, 0, this.particle.radius).endFill();
      if (this.enableSelection && this.selected) {
        graphics.beginStroke("blue").setStrokeStyle(3).drawCircle(0, 0, this.particle.radius).endStroke();
        graphics = this.tail.graphics;
        graphics.clear();
        len = pastPositions.length;
        for (i = j = 0, ref = len - 1; j <= ref; i = j += 1) {
          p = pastPositions[(i + this.particle.curPos) % len];
          px = p.x - this.particle.x;
          py = p.y - this.particle.y;
          r_a = i / len;
          col = "rgba(100, 100, 100, " + r_a + ")";
        }
        return graphics.beginStroke(col).drawCircle(px, py, this.particle.radius).endStroke();
      }
    };

    return ParticleRenderer;

  })(Renderer);

}).call(this);

},{"../../../events/event-manager":4,"../../../interpolator":5,"../../../math/point-2d":6,"../renderer":15}],15:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
(function() {
  var Renderer;

  module.exports = Renderer = (function() {
    function Renderer() {}

    Renderer.prototype.draw = function(interpolation) {};

    return Renderer;

  })();

}).call(this);

},{}],16:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
(function() {
  var Renderer, SimulationRenderer,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Renderer = require("./renderer");

  module.exports = SimulationRenderer = (function(superClass) {
    extend(SimulationRenderer, superClass);

    function SimulationRenderer(canvas, interpolator) {
      this.canvas = canvas;
      this.interpolator = interpolator;
    }

    SimulationRenderer.prototype.addParticle = function(particle) {};

    SimulationRenderer.prototype.removeParticle = function(particle) {};

    return SimulationRenderer;

  })(Renderer);

}).call(this);

},{"./renderer":15}],17:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
(function() {
  var EaselJSRenderer, EventManager, Particle, Simulation, Widget,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Widget = require("./widget");

  Particle = require('../objects/particle');

  EventManager = require("../events/event-manager");

  EaselJSRenderer = require("./renderer/easeljs/easeljs-renderer");

  module.exports = Simulation = (function(superClass) {
    var selected;

    extend(Simulation, superClass);

    selected = null;

    function Simulation(canvasName, engine, interpolator, settings) {
      this.engine = engine;
      this.interpolator = interpolator;
      this.settings = settings;
      Simulation.__super__.constructor.call(this, canvasName);
      this.engine.width = this.width;
      this.engine.height = this.height;
      this.renderer = new EaselJSRenderer(this.canvasName, this.interpolator, this.settings);
      EventManager.eventify(this);
    }

    Simulation.prototype.resize = function(newWidth, newHeight) {
      return this.engine.setBounds(newWidth, newHeight);
    };

    Simulation.prototype.addParticle = function(x, y, mass, radius, style) {
      var particle;
      particle = new Particle(x, y, radius, style, this.settings);
      particle.mass = mass;
      this.renderer.addParticle(particle);
      particle.addListener("select", (function(_this) {
        return function(ev, particle) {
          return _this.selected = particle;
        };
      })(this)).addListener("deselect", (function(_this) {
        return function(ev, particle) {
          return _this.selected = null;
        };
      })(this));
      this.engine.particles.push(particle);
      return particle;
    };

    Simulation.prototype.removeParticle = function(index) {
      var i, j, len, p, ref, results;
      if (typeof index === "object") {
        this.renderer.removeParticle(index);
        ref = this.engine.particles;
        results = [];
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          p = ref[i];
          if (p === index) {
            this.engine.particles.splice(i, 1);
            break;
          } else {
            results.push(void 0);
          }
        }
        return results;
      } else {
        this.renderer.removeParticle(this.engine.particles[index]);
        return this.engine.particles.splice(index, 1);
      }
    };

    Simulation.prototype.loadParticles = function(toBeLoaded) {
      var j, len, obj, particle, results;
      this.restart();
      results = [];
      for (j = 0, len = toBeLoaded.length; j < len; j++) {
        obj = toBeLoaded[j];
        particle = this.addParticle(obj.x, obj.y, obj.mass, obj.radius, obj.style);
        particle.xVel = obj.xVel;
        particle.yVel = obj.yVel;
        results.push(particle.cOR = obj.cOR);
      }
      return results;
    };

    Simulation.prototype.saveParticles = function(saved) {
      var j, len, particle, ref, results;
      ref = this.engine.particles;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        particle = ref[j];
        results.push(saved.push(particle.copy()));
      }
      return results;
    };

    Simulation.prototype.removeSelected = function() {
      var i, j, len, particle, ref;
      if (selected !== null) {
        ref = this.particles;
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          particle = ref[i];
          if (particle === selected) {
            this.removeParticle(i);
          }
        }
        return selected = null;
      }
    };

    Simulation.prototype.getSelected = function() {
      return selected;
    };

    Simulation.prototype.restart = function() {
      this.renderer.clear();
      selected = null;
      this.engine.reset();
      return this.fire("restart");
    };

    Simulation.prototype.draw = function(interpolation) {
      this.renderer.draw(interpolation);
      return this.fire("draw");
    };

    return Simulation;

  })(Widget);

}).call(this);

},{"../events/event-manager":4,"../objects/particle":8,"./renderer/easeljs/easeljs-renderer":13,"./widget":18}],18:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
(function() {
  var Widget;

  module.exports = Widget = (function() {
    function Widget(canvasName) {
      this.canvasName = canvasName;
      this.canvas = $("#" + this.canvasName);
      this.width = this.canvas.width();
      this.height = this.canvas.height();
      this.hidden = false;
      this.stage = new createjs.Stage(this.canvasName);
      this.canvas.attr("width", this.width);
      this.canvas.attr("height", this.height);
    }

    Widget.prototype.init = function() {};

    Widget.prototype.addEventListener = function(event, handler) {
      return this.stage.addEventListener(event, handler);
    };

    Widget.prototype.draw = function(interpolation) {};

    Widget.prototype.restart = function() {};

    Widget.prototype.stop = function() {};

    Widget.prototype.resume = function() {
      return this.paused = false;
    };

    Widget.prototype.pause = function() {
      return this.paused = true;
    };

    Widget.prototype.resize = function(newWidth, newHeight) {
      this.width = newWidth;
      return this.height = newHeight;
    };

    Widget.prototype.show = function() {
      this.hidden = false;
      return this.canvas.fadeIn(200);
    };

    Widget.prototype.hide = function() {
      this.hidden = true;
      return this.canvas.fadeOut(200);
    };

    return Widget;

  })();

}).call(this);

},{}]},{},[1]);
