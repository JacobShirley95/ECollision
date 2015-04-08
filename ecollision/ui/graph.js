function Graph(canvasName, engine, scaleX, scaleY, settings) {
    Widget.call(this, canvasName);
    
    this.scaleX = scaleX;
    this.scaleY = scaleY;

    this.x = 0;
    this.y = 0;

    this.engine = engine;
    
    var graph = new createjs.Shape();

    var offsetX = 0.0;
    var offsetY = 0.0;

    var userY = 0;
    
    var data = [];
    var start = 0;
    var maxLen = 150;
    
    var updated = false;

    var currX = 0;
    var currY = 0;
    
    this.init = function() {
        var xAxis = new createjs.Shape();
        var yAxis = new createjs.Shape();
    
        xAxis.graphics.beginStroke("red").moveTo(this.x, this.height).lineTo(this.width, this.height);
        yAxis.graphics.beginStroke("red").moveTo(this.x, this.y).lineTo(this.x, this.height);
        
        this.stage.addChild(xAxis);
        this.stage.addChild(yAxis);
        
        this.stage.addChild(graph);
        
        this.updateData();
    }
    
    this.draw = function (interpolation) {
        if (this.engine != null) {
            var g = graph.graphics;
            
            g.clear();
            
            var length = data.length-1;
            var total = 0;

            for (var j = 0; j < length-1; j++) {
                if (updated) {
                    updated = false;
                    return;
                }
                
                total += data[j].y;
                
                //calculate offsetted index for point at index j
                var i = (start+j)%length;
                var i2 = (start+j+1)%length;
                
                var x2 = (data[i].x*this.scaleX)-offsetX;
                var y2 = (data[i].y*this.scaleY)+offsetY+userY;
                
                //if second x value is larger than width, move graph along
                if (x2 > this.width) {
                    offsetX += x2-this.width;
                }
        
                var x1 = (data[i].x*this.scaleX)-offsetX;
                var y1 = (data[i].y*this.scaleY)+offsetY+userY;
                
                var x3 = (data[i2].x*this.scaleX)-offsetX;
                var y3 = (data[i2].y*this.scaleY)+offsetY+userY;
                
                g.beginStroke("red").moveTo(this.x+x1, this.y+this.height-y1).lineTo(this.x+x3, this.y+this.height-y3);
            }
            
            if (!this.paused) {
                currX += 1000/settings.updateRate;
                currY = this.getEnergy();
                
                this.addData(currX, currY);
            }
                
            var dataY = total/data.length;
            var targetY = this.height/2;
        
            offsetY = targetY-(dataY*this.scaleY);
            
            this.stage.update();
        }
    }

    this.restart = function() {
        data = [];
        start = 0;
        currX = currY = 0;
        offsetX = offsetY = 0;
        updated = true;
    }
    
    this.calibrate = function() {
        userY = 0;
    }
    
    this.zoomIn = function() {
        this.scaleX *= settings.graphZoomFactor;
        this.scaleY *= settings.graphZoomFactor;
        
        offsetX *= this.scaleX;
        offsetY *= this.scaleY;
        
        this.updateData();
    }
    
    this.zoomOut = function() {
        this.scaleX /= settings.graphZoomFactor;
        this.scaleY /= settings.graphZoomFactor;
        
        offsetX *= this.scaleX;
        offsetY *= this.scaleY;

        this.updateData();
    }
    
    this.moveUp = function() {
        userY -= 5;
    }
    
    this.moveDown = function() {
        userY += 5;
    }
    
    this.addData = function(x, y) {
        if (data.length > maxLen) {
            var s = start;
 
            start = (start + 1)%maxLen;

            data[s] = new Point2D(x, y);
        } else {
            data.push(new Point2D(x, y));
        }
    }
    
    this.updateData = function() {
        var data2 = [];

        maxLen = Math.round(this.width/((1000/settings.updateRate)*this.scaleX))+5;

        var aLen = data.length-1;
        var diff = 0;
        
        if (aLen > maxLen) {
            diff = aLen-maxLen;
        }
        
        for (var j = diff; j < aLen; j++) {
            var i = (start+j)%aLen;
            data2.push(data[i]);
        }
        
        updated = true;
        start = 0;
        
        data = data2;
    }
    
    this.getEnergy = function() {
        var energy = 0.0;

        for (var i = 0; i < this.engine.numOfParticles(); i++) {
            energy += this.engine.getParticle(i).getEnergy();
        }
        
        return Math.round(energy/1000);
    }
}

Graph.prototype = new Widget();