function Graph(canvasName) {
    Widget.call(this, canvasName);
    
    this.scaleX = 1/15;
    this.scaleY = 1/15000;
    
    this.lineHeight = 10;
    
    this.data = [];
    this.count = 0;
    
    this.simulation = null;

    this.xAxis = new createjs.Shape();
    this.yAxis = new createjs.Shape();
    
    this.width = 200;
    this.height = 200;
    
    this.x = 10;
    this.y = 110;
    
    this.xAxis.graphics.beginStroke("red").moveTo(10, this.height).lineTo(this.width, this.height);
    this.yAxis.graphics.beginStroke("red").moveTo(10, 10).lineTo(10, this.height);
    
    this.graph = new createjs.Shape();
    
    this.xText = new createjs.Text();
    this.xText.x = this.width-10;
    this.xText.y = this.height;
    this.xText.color = "red";
    
    this.yText = new createjs.Text();
    this.yText.x = 0;
    this.yText.y = 0;
    this.yText.color = "red";
    
    this.stage.addChild(this.xAxis);
    this.stage.addChild(this.yAxis);
    this.stage.addChild(this.graph);
    
    this.stage.addChild(this.xText);
    this.stage.addChild(this.yText);
    
    this.offsetX = 0.0;
    this.offsetY = 0.0;
    
    this.zoom = 1.0;
    
    var x = 10;
    var y = 10;
    
    var maxX = 0;
    var maxY = 0;
    
    this.start = 0;
    this.maxLen = 100;
    
    this.updated = false;
    
    this.draw = function () {
        var width = this.width;
        var height = this.height;
        
        var g = this.graph.graphics;
        
        g.clear();
        
        var rMaxX = 0;
        var rMaxY = 0;
        
        var start = this.start;
        var len = this.maxLen;
        
        var aLen = this.data.length;
        
        for (var j = 0; j < aLen-2; j++) {
            if (this.updated) {
                this.updated = false;
                return;
            }
            var i = (start+j)%len;
            var i2 = (start+j+1)%len;
            
            var x2 = (this.data[i2].x*this.scaleX)-this.offsetX;
            var y2 = this.data[i2].y*this.scaleY;
            
            if (x2 > this.width) {
                this.offsetX += x2-this.width;
            }
            
            if (maxX < this.data[i].x)
                maxX = this.data[i].x;
            
            if (maxY < this.data[i].y)
                maxY = this.data[i].y;
    
            var x1 = (this.data[i].x*this.scaleX)-this.offsetX;
            var y1 = this.data[i].y*this.scaleY;
            
            var x3 = (this.data[i2].x*this.scaleX)-this.offsetX;
            var y3 = this.data[i2].y*this.scaleY;
                
            g.beginStroke("red").moveTo(this.x+x1, this.height-y1).lineTo(this.x+x3, this.height-y3);
        }
        
        this.xText.text = maxX;
        this.yText.text = maxY;
        
        x += this.simulation.updateTime;
        y = this.getEnergy();
        
        this.addData(x, y);
        
        this.stage.update();
    }
    
    this.zoomIn = function() {
        this.scaleX *= 1.25;
        this.scaleY *= 1.25;
        
        this.offsetX *= this.scaleX;
        
        this.updateData();
    }
    
    this.zoomOut = function() {
        this.scaleX /= 1.25;
        this.scaleY /= 1.25;
        
        this.offsetX *= this.scaleX;

        this.updateData();
    }
    
    this.addData = function(x, y) {
        var data = this.data;
        
        if (this.data.length > this.maxLen) {
            var s = this.start;
 
            this.start = (this.start + 1)%this.maxLen;
            data[s] = new Point2D(x, y);
        } else {
            data.push(new Point2D(x, y));
        }
        
        this.count++;
    }
    
    this.updateData = function() {
        var data = [];
        
        var start = this.start;
        var len = this.maxLen;
        
        this.maxLen = Math.round(this.width/(this.simulation.updateTime*this.scaleX));

        var aLen = this.data.length-1;
        var diff = 0;
        if (aLen > this.maxLen) {
            diff = aLen-this.maxLen;
        }
        
        
        for (var j = diff; j < aLen; j++) {
            var i = (start+j)%aLen;
            data.push(this.data[i]);
        }
        
        this.updated = true;
        this.start = 0;
        
        this.data = data;
    }
    
    this.getEnergy = function() {
        var energy = 0.0;
        var objects = this.simulation.objects;
        $.each(objects, function(i, object) {
            energy += 0.5*object.mass*((object.xVel*object.xVel)+(object.yVel*object.yVel));
        });
        
        return energy;
    }
    
    this.removeData = function(x, y) {
        
    }
    
    this.attachSimulation = function(simulation) {
        this.simulation = simulation;
        this.maxLen = this.width/(this.simulation.updateTime*this.scaleX);
    }
    
    this.detachSimulation = function() {
        this.simulation = null;
    }
}

Graph.prototype = new Widget();