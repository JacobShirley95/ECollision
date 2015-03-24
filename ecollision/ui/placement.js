function Placement(canvasName) {
    Widget.call(this, canvasName);
    
    var mouseX = this.width/2;
    var mouseY = this.height/2;
    
    var tempObject = new Particle();
    
    var crossHair = new createjs.Shape();
    var grid = new createjs.Shape();
    var gridGraphics = grid.graphics;
    gridGraphics.beginStroke("green");
    
    var interval = 20;
    
    for (var i = 0; i < this.width/interval; i++) {
        gridGraphics.moveTo(i*interval, 0).lineTo(i*interval, this.height);
    }
    
    for (var i = 0; i < this.height/interval; i++) {
        gridGraphics.moveTo(0, i*interval).lineTo(this.width, i*interval);
    }
    
   
    this.stage.addChild(grid);
     this.stage.addChild(crossHair);
    
    this.stage.addEventListener("stagemousemove", function (ev) {
        mouseX = ev.stageX;
        mouseY = ev.stageY;
        
        var gridX = Math.round(mouseX/interval);
        var gridY = Math.round(mouseY/interval);
        
        mouseX = gridX*interval;
        mouseY = gridY*interval;
        
        showCrossHair();
    });
    
    this.draw = function() {}
    
    var stage = this.stage;
    var w = this.width;
    var h = this.height;
    
    function showCrossHair() {
        crossHair.graphics.clear().beginStroke("red").moveTo(0, mouseY).lineTo(w, mouseY);
        crossHair.graphics.beginStroke("red").moveTo(mouseX, 0).lineTo(mouseX, h);
        
        stage.update();
    }
    
    showCrossHair();
}

Placement.prototype = new Widget();