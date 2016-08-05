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

    function Overlay(canvasName, simulation1, settings) {
      this.simulation = simulation1;
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
      var dx, dy, g, gridX, gridY, i, len, p, ref;
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
          ref = this.simulation.engine.particles;
          for (i = 0, len = ref.length; i < len; i++) {
            p = ref[i];
            dx = p.x - mouseX;
            dy = p.y - mouseY;
            if (dx * dx + dy * dy <= p.radius * p.radius) {
              p.select();
              tempObject = p;
            } else {
              p.deselect();
            }
          }
          break;
      }
    };

    Overlay.prototype.handleClick = function(ev) {
      var p, selected;
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
              this.stage.removeChild(tempObject.displayObj);
            } else {
              index = INDEX_PLACE;
            }
            break;
          case INDEX_MODIFY:
            tempObject.displayObj.dispatchEvent("click");
            if (ev.button === 2) {
              this.simulation.removeSelected();
            } else {
              selected = tempObject;
              tempObject = selected.copy();
              lastX = selected.x;
              lastY = selected.y;
              this.stage.addChild(tempObject.displayObj);
              if (!copyPlace) {
                this.simulation.removeSelected();
              }
              index = INDEX_PLACE;
            }
            break;
        }
      }
      return ev.stopPropagation();
    };

    Overlay.prototype.draw = function(interpolation) {
      if (!this.hidden) {
        if (tempObject !== null) {
          tempObject.draw(tempObject.x, tempObject.y);
        }
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
      var p;
      if (mode === MODE_EDIT) {
        p = simulation.addParticle(lastX, lastY, tempObject.mass, tempObject.radius, tempObject.style);
        p.xVel = tempObject.xVel;
        p.yVel = tempObject.yVel;
        this.removeChild(tempObject.displayObj);
        tempObject = null;
        return index = INDEX_MODIFY;
      } else {
        this.stage.removeChild(velocityLine);
        this.stage.removeChild(infoText);
        return index = INDEX_PLACE;
      }
    };

    Overlay.prototype.beginAdd = function(mass, cOR, style) {
      this.show();
      this.init();
      tempObject = new Particle(crossX, crossY, 25, style, this.settings);
      tempObject.mass = mass;
      tempObject.cOR = cOR;
      infoText.x = mouseX;
      infoText.y = mouseY;
      this.stage.addChild(tempObject.displayObj);
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
      this.stage.removeAllChildren();
      if (tempObject !== null) {
        tempObject = null;
      }
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
