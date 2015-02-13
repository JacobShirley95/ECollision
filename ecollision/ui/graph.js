function Graph(canvasName) {
    Widget.call(this, canvasName);
    
    this.scaleX = 1/5;
    this.scaleY = 1/50;

    this.simulation = null;
    
    var graph = new createjs.Shape();
    
    var xText = new createjs.Text();
    var yText = new createjs.Text();
    
    var offsetX = 0.0;
    var offsetY = 0.0;
    
    var data = [];
    var start = 0;
    var maxLen = 150;

    this.zoom = 1.0;
    
    var maxX = 0;
    var maxY = 0;
    
    var updated = false;
    
    this.x = 0;
    this.y = 0;
    
    var renderY = 0;
    
    var x = 0;
    var y = 0;
    
    this.init = function() {
        var xAxis = new createjs.Shape();
        var yAxis = new createjs.Shape();
    
        xAxis.graphics.beginStroke("red").moveTo(this.x, this.height).lineTo(this.width, this.height);
        yAxis.graphics.beginStroke("red").moveTo(this.x, this.y).lineTo(this.x, this.height);
        
        xText.x = this.width-10;
        xText.y = this.height;
        xText.color = "red";

        yText.x = 0;
        yText.y = 0;
        yText.color = "red";
        
        this.stage.addChild(xAxis);
        this.stage.addChild(yAxis);
        
        this.stage.addChild(graph);
    
        this.stage.addChild(xText);
        this.stage.addChild(yText);
        
        this.updateData();
    }
    
    this.draw = function () {
        var width = this.width;
        var height = this.height;
        
        var g = graph.graphics;
        
        g.clear();
        
        var rMaxX = 0;
        var rMaxY = 0;
        
        var aLen = data.length-1;
        
        var len = aLen;

        for (var j = 0; j < aLen-1; j++) {
            if (updated) {
                updated = false;
                return;
            }
            var i = (start+j)%len;
            var i2 = (start+j+1)%len;
            
            var x2 = (data[i].x*this.scaleX)-offsetX;
            var y2 = (data[i].y*this.scaleY)+renderY;
            
            if (x2 > width) {
                offsetX += x2-this.width;
            }
            
            if (maxX < data[i].x)
                maxX = data[i].x;
            
            if (maxY < data[i].y)
                maxY = data[i].y;
    
            var x1 = (data[i].x*this.scaleX)-offsetX;
            var y1 = (data[i].y*this.scaleY)+renderY;
            
            var x3 = (data[i2].x*this.scaleX)-offsetX;
            var y3 = (data[i2].y*this.scaleY)+renderY;
            
            g.beginStroke("red").moveTo(this.x+x1, this.y+this.height-y1).lineTo(this.x+x3, this.y+this.height-y3);
            
            if (j == aLen-3) {
                console.log("1: "+data[i].x);
            }
            
            if (j == aLen-2) {
                console.log("2: "+data[i].x);
            }
        }
        
        //xText.text = maxX;
        //yText.text = maxY;
        
        x += this.simulation.getUpdateTime();
        y = this.getEnergy();
        
        this.addData(x, y);
        
        this.calibrate();
        
        this.stage.update();
    }
    
    this.calibrate = function() {
        var len = data.length;
        if (len > 0) {
            var avg = 0;
            for (var j = 0; j < len; j++) {
                avg += data[j].y;
            }
            
            var dataY = avg/len;
            var targetY = this.height/2;
        
            renderY = targetY-(dataY*this.scaleY);
            
            //updated = true;
        }
    }
    
    this.zoomIn = function() {
        this.scaleX *= 1.25;
        this.scaleY *= 1.25;
        
        offsetX *= this.scaleX;
        
        this.updateData();
    }
    
    this.zoomOut = function() {
        this.scaleX /= 1.25;
        this.scaleY /= 1.25;
        
        offsetX *= this.scaleX;

        this.updateData();
    }
    
    this.moveUp = function() {
        renderY -= 5;
    }
    
    this.moveDown = function() {
        renderY += 5;
    }
    
    this.addData = function(x, y) {
        if (data.length > maxLen) {
            var s = start;
 
            start = (start + 1)%maxLen;
            
            console.log(start);
            
            data[s] = new Point2D(x, y);
        } else {
            data.push(new Point2D(x, y));
        }
    }
    
    this.updateData = function() {
        var data2 = [];

        maxLen = Math.round(this.width/(this.simulation.getUpdateTime()*this.scaleX))+5;

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
        var objects = this.simulation.objects;
        $.each(objects, function(i, object) {
            energy += 0.5*object.mass*((object.xVel*object.xVel)+(object.yVel*object.yVel));
        });
        
        return Math.round(energy/1000);
    }
    
    this.attachSimulation = function(simulation) {
        this.simulation = simulation;
        this.updateData();
        x = this.simulation.getUpdateTime();
    }
    
    this.detachSimulation = function() {
        this.simulation = null;
    }
}

Graph.prototype = new Widget();