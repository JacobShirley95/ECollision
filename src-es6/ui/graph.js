// Generated by CoffeeScript 2.2.2
var Graph;

import Widget from "./widget.js";

import Particle from "../objects/particle.js";

import Point2D from "../math/point-2d.js";

export default Graph = (function() {
  class Graph extends Widget {
    constructor(canvasName, engine, scaleX, scaleY, settings) {
      super(canvasName);
      this.engine = engine;
      this.scaleX = scaleX;
      this.scaleY = scaleY;
      this.settings = settings;
    }

    init() {
      var xAxis, yAxis;
      xAxis = new createjs.Shape();
      yAxis = new createjs.Shape();
      xAxis.graphics.beginStroke("red").moveTo(this.x, 0).lineTo(this.width, 0);
      xAxis.x = this.x;
      xAxis.y = this.height;
      yAxis.graphics.beginStroke("red").moveTo(0, this.y).lineTo(0, this.height);
      yAxis.x = this.x;
      yAxis.y = 0;
      xAxis.cache(-1, -5, this.width, 10);
      yAxis.cache(-5, -1, 10, this.height);
      this.stage.addChild(xAxis);
      this.stage.addChild(yAxis);
      this.stage.addChild(this.graph);
      this.stage.update();
      return this.updateData();
    }

    draw(interpolation) {
      var g, i, i2, j, length, targetY, total, x1, x2, x3, y1, y2, y3;
      if (this.engine !== null) {
        g = this.graph.graphics;
        g.clear();
        length = this.data.length - 1;
        total = 0;
        j = 0;
        while (j < length - 1) {
          if (this.updated) {
            this.updated = false;
            return;
          }
          total += this.data[j].y;
          //calculate offsetted index for point at index j
          i = (this.start + j) % length;
          i2 = (this.start + j + 1) % length;
          x2 = (this.data[i].x * this.scaleX) - this.offsetX;
          y2 = (this.data[i].y * this.scaleY) + this.offsetY + this.userY;
          //if second x value is larger than width, move graph along
          if (x2 > this.width) {
            this.offsetX += x2 - this.width;
          }
          x1 = (this.data[i].x * this.scaleX) - this.offsetX;
          y1 = (this.data[i].y * this.scaleY) + this.offsetY + this.userY;
          x3 = (this.data[i2].x * this.scaleX) - this.offsetX;
          y3 = (this.data[i2].y * this.scaleY) + this.offsetY + this.userY;
          g.beginStroke("red").moveTo(this.x + x1, this.y + this.height - y1).lineTo(this.x + x3, this.y + this.height - y3);
          j++;
        }
        if (!this.paused) {
          this.currX += 1000 / this.settings.global.updateRate;
          this.currY = this.getEnergy();
          this.addData(this.currX, this.currY);
        }
        this.graph.cache(0, 0, this.width, this.height);
        this.dataY = total / this.data.length;
        targetY = this.height / 2;
        this.offsetY = targetY - (this.dataY * this.scaleY);
        return this.stage.update();
      }
    }

    restart() {
      this.data = [];
      this.start = 0;
      this.currX = this.currY = 0;
      this.offsetX = this.offsetY = 0;
      return this.updated = true;
    }

    calibrate() {
      return this.userY = 0;
    }

    zoomIn() {
      if (this.zoomIndex < this.settings.graph.graphMaxZoomIndex) {
        this.scaleX *= this.settings.graph.graphZoomFactor;
        this.scaleY *= this.settings.graph.graphZoomFactor;
        this.offsetX *= this.scaleX;
        this.offsetY *= this.scaleY;
        this.updateData();
        return this.zoomIndex++;
      } else {
        throw "ERROR: Maximum zoom reached";
      }
    }

    zoomOut() {
      if (this.zoomIndex > -this.settings.graph.graphMinZoomIndex) {
        this.scaleX /= this.settings.graph.graphZoomFactor;
        this.scaleY /= this.settings.graph.graphZoomFactor;
        this.offsetX *= this.scaleX;
        this.offsetY *= this.scaleY;
        this.updateData();
        return this.zoomIndex--;
      } else {
        throw "ERROR: Minimum zoom reached";
      }
    }

    moveUp() {
      return this.userY -= 5;
    }

    moveDown() {
      return this.userY += 5;
    }

    getZoomIndex() {
      return this.zoomIndex;
    }

    addData(x, y) {
      var s;
      if (this.data.length > this.maxLen) {
        s = this.start;
        this.start = (this.start + 1) % this.maxLen;
        return this.data[s] = new Point2D(x, y);
      } else {
        return this.data.push(new Point2D(x, y));
      }
    }

    updateData() {
      var aLen, diff, i, j, k, ref, ref1;
      this.data2 = [];
      this.maxLen = Math.round(this.width / ((1000 / this.settings.global.updateRate) * this.scaleX)) + 5;
      aLen = this.data.length - 1;
      diff = 0;
      if (aLen > this.maxLen) {
        diff = aLen - this.maxLen;
      }
      for (j = k = ref = diff, ref1 = aLen - 1; 1 !== 0 && (1 > 0 ? k <= ref1 : k >= ref1); j = k += 1) {
        i = (this.start + j) % aLen;
        this.data2.push(this.data[i]);
      }
      this.updated = true;
      this.start = 0;
      return this.data = this.data2;
    }

    getEnergy() {
      var energy, k, len, particle, ref;
      energy = 0.0;
      ref = this.engine.particles;
      for (k = 0, len = ref.length; k < len; k++) {
        particle = ref[k];
        energy += particle.getEnergy();
      }
      return Math.round(energy / 1000);
    }

  };

  Graph.prototype.x = 0;

  Graph.prototype.y = 0;

  Graph.prototype.scaleX = 0;

  Graph.prototype.scaleY = 0;

  Graph.prototype.graph = new createjs.Shape();

  Graph.prototype.offsetX = 0.0;

  Graph.prototype.offsetY = 0.0;

  Graph.prototype.userY = 0;

  Graph.prototype.data = [];

  Graph.prototype.start = 0;

  Graph.prototype.maxLen = 150;

  Graph.prototype.updated = false;

  Graph.prototype.currX = 0;

  Graph.prototype.currY = 0;

  Graph.prototype.zoomIndex = 0;

  return Graph;

}).call(this);
