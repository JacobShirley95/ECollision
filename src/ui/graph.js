/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Graph;
import Widget from "./widget";
import Particle from '../objects/particle';
import Point2D from '../math/point-2d';

export default (Graph = (function() {
    Graph = class Graph extends Widget {
        static initClass() {
            this.prototype.x = 0;
            this.prototype.y = 0;
            this.prototype.scaleX = 0;
            this.prototype.scaleY = 0;
    
            this.prototype.graph = new createjs.Shape();
    
            this.prototype.offsetX = 0.0;
            this.prototype.offsetY = 0.0;
    
            this.prototype.userY = 0;
        
            this.prototype.data = [];
            this.prototype.start = 0;
            this.prototype.maxLen = 150;
        
            this.prototype.updated = false;
    
            this.prototype.currX = 0;
            this.prototype.currY = 0;
    
            this.prototype.zoomIndex = 0;
        }

        constructor(canvasName, engine, scaleX, scaleY, settings) {
            {
              // Hack: trick Babel/TypeScript into allowing this before super.
              if (false) { super(); }
              let thisFn = (() => { this; }).toString();
              let thisName = thisFn.slice(thisFn.indexOf('{') + 1, thisFn.indexOf(';')).trim();
              eval(`${thisName} = this;`);
            }
            this.engine = engine;
            this.scaleX = scaleX;
            this.scaleY = scaleY;
            this.settings = settings;
            super(canvasName);
        }
    
        init() {
            const xAxis = new createjs.Shape();
            const yAxis = new createjs.Shape();

            xAxis.graphics.beginStroke("red").moveTo(this.x, this.height).lineTo(this.width, this.height);
            yAxis.graphics.beginStroke("red").moveTo(this.x, this.y).lineTo(this.x, this.height);
        
            this.stage.addChild(xAxis);
            this.stage.addChild(yAxis);
        
            this.stage.addChild(this.graph);
            this.stage.update();
        
            return this.updateData();
        }
    
        draw(interpolation) {
            if (this.engine !== null) {
                const g = this.graph.graphics;
            
                g.clear();
            
                const length = this.data.length-1;
                let total = 0;

                let j = 0;
                while (j < (length-1)) {
                    if (this.updated) {
                        this.updated = false;
                        return;
                    }
                
                    total += this.data[j].y;
                
                    //calculate offsetted index for point at index j
                    const i = (this.start+j)%length;
                    const i2 = (this.start+j+1)%length;
                
                    const x2 = (this.data[i].x*this.scaleX)-this.offsetX;
                    const y2 = (this.data[i].y*this.scaleY)+this.offsetY+this.userY;
                
                    //if second x value is larger than width, move graph along
                    if (x2 > this.width) {
                        this.offsetX += x2-this.width;
                    }
        
                    const x1 = (this.data[i].x*this.scaleX)-this.offsetX;
                    const y1 = (this.data[i].y*this.scaleY)+this.offsetY+this.userY;
                
                    const x3 = (this.data[i2].x*this.scaleX)-this.offsetX;
                    const y3 = (this.data[i2].y*this.scaleY)+this.offsetY+this.userY;
                
                    g.beginStroke("red").moveTo(this.x+x1, (this.y+this.height)-y1).lineTo(this.x+x3, (this.y+this.height)-y3);
                    j++;
                }

                if (!this.paused) {
                    this.currX += 1000/this.settings.global.updateRate;
                    this.currY = this.getEnergy();

                    this.addData(this.currX, this.currY);
                }
                
                this.dataY = total/this.data.length;
                const targetY = this.height/2;
        
                this.offsetY = targetY-(this.dataY*this.scaleY);
            
                return this.stage.update();
            }
        }

        restart() {
            this.data = [];
            this.start = 0;
            this.currX = (this.currY = 0);
            this.offsetX = (this.offsetY = 0);
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
            } else { throw("ERROR: Maximum zoom reached"); }
        }
    
        zoomOut() {
            if (this.zoomIndex > -this.settings.graph.graphMinZoomIndex) {
                this.scaleX /= this.settings.graph.graphZoomFactor;
                this.scaleY /= this.settings.graph.graphZoomFactor;
            
                this.offsetX *= this.scaleX;
                this.offsetY *= this.scaleY;

                this.updateData();

                return this.zoomIndex--;
            } else { throw("ERROR: Minimum zoom reached"); }
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
            if (this.data.length > this.maxLen) {
                const s = this.start;
 
                this.start = (this.start + 1)%this.maxLen;

                return this.data[s] = new Point2D(x, y);
            } else {
                return this.data.push(new Point2D(x, y));
            }
        }
    
        updateData() {
            this.data2 = [];

            this.maxLen = Math.round(this.width/((1000/this.settings.global.updateRate)*this.scaleX))+5;

            const aLen = this.data.length-1;
            let diff = 0;
        
            if (aLen > this.maxLen) {
                diff = aLen-this.maxLen;
            }

            for (let j = diff, end = aLen-1; j <= end; j++) {
                const i = (this.start+j)%aLen;
                this.data2.push(this.data[i]);
            }
        
            this.updated = true;
            this.start = 0;
        
            return this.data = this.data2;
        }
    
        getEnergy() {
            let energy = 0.0;

            for (let particle of Array.from(this.engine.particles)) {
                energy += particle.getEnergy();
            }
        
            return Math.round(energy/1000);
        }
    };
    Graph.initClass();
    return Graph;
})());