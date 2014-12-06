function Graph(canvasName) {
    Widget.call(this, canvasName);
    
    this.scaleX = 5.0;
    this.scaleY = 5.0;
    
    this.lineHeight = 10;
    this.sampleRate = sampleRate;
    
    this.data = [];
    
    this.simulation = null;
    
    this.attachSimulation = function(simulation) {
        this.simulation = simulation;
    }
    
    this.detachSimulation = function() {
        this.simulation = null;
    }
    
    this.xAxis = new createjs.Shape();
    this.yAxis = new createjs.Shape();
    
    this.stage.addChild(this.xAxis);
    this.stage.addChild(this.yAxis);
    
    this.draw = function () {
        var width = this.width;
        var height = this.height;
        
        var divW = this.lineHeight;
        
        var g = this.xAxis.graphics;
        
        g.beginStroke("black");
        g.moveTo(divW/2, height-(divW/2));
        g.lineTo(width, height-(divW/2));
        
        for (var i = 1; i < width/20; i++) {
            var x = i*20;
            
            g.moveTo(x, height-divW);
            g.lineTo(x, height);
        }
        g.endStroke();
        
        g = this.yAxis.graphics;
        
        g.beginStroke("black");
        g.moveTo(divW/2, 0);
        g.lineTo(divW/2, height-(divW/2));
        
        for (var i = 1; i < height/20; i++) {
            var y = height-(i*20);
            
            g.moveTo(0, y);
            g.lineTo(divW, y);
        }
        
        g.endStroke();
    }
    
    this.addData = function(x, y) {
        data.push(new Point2D(x, y));
    }
    
    this.removeData = function(x, y) {
        
    }
}

Graph.prototype = new Widget();