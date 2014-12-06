function Widget(canvasName, width, height) {
    this.active = false;
    this.owner = null;
    
    this.stage = new createjs.Stage(canvasName);
    
    this.width = width;
    this.height = height;
    
    this.zoom = 1.0;
    
    this.init = function() {}

    this.addEventListener = function(event, handler) {
        this.stage.addEventListener(event, handler);
    }
    
    this.draw = function () {}
    
    this.restart = function () {}
    
    this.stop = function() {}
    
    this.resize = function(newWidth, newHeight) {}
}