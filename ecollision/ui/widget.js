function Widget(canvasName) {
    this.active = false;
    this.owner = null;
    
    var can = $("#"+canvasName);
    
    $("#"+canvasName).attr("width",$("#"+canvasName).width());
    $("#"+canvasName).attr("height",$("#"+canvasName).height());
    
    this.width = can.attr("width");
    this.height = can.attr("height");
    
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