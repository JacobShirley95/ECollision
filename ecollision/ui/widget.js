function Widget(canvasName) {
    this.hidden = false;
    this.owner = null;
    
    this.canvasName = canvasName;
    this.canvas = $("#"+canvasName);
    
    this.width = this.canvas.width();
    this.height = this.canvas.height();
    
    this.canvas.attr("width", this.width);
    this.canvas.attr("height", this.height);
    
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
    
    this.show = function() {
        this.canvas.fadeIn();
        this.hidden = false;
    }
    
    this.hide = function() {
        this.canvas.fadeOut();
        this.hidden = true;
    }
}