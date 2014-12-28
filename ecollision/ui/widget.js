function Widget(canvasName) {
    this.active = false;
    this.owner = null;
    
    this.stage = new createjs.Stage(canvasName);
    
    function RenderData() {
        this.zoom = 1.0;

        this.offsetX = 0.0;
        this.offsetY = 0.0;
    }

    this.renderData = new RenderData();
    
    this.init = function() {}

    this.addEventListener = function(event, handler) {
        this.stage.addEventListener(event, handler);
    }
    
    this.draw = function () {}
    
    this.restart = function () {}
    
    this.stop = function() {}
    
    this.resize = function(newWidth, newHeight) {}
}