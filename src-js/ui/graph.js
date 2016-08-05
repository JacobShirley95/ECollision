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