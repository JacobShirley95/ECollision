function Widget(canvasName) {
    this.hidden = false;
    
    this.canvasName = canvasName;
    this.canvas = $("#"+canvasName);
    
    this.width = this.canvas.width();
    this.height = this.canvas.height();
    
    this.stage = new createjs.Stage(canvasName);

    this.canvas.attr("width", this.width);
    this.canvas.attr("height", this.height);

    this.init = function() {}

    this.addEventListener = function(event, handler) {
        this.stage.addEventListener(event, handler);
    }
    
    this.draw = function (interpolation) {}
    
    this.restart = function () {}
    
    this.stop = function() {}

    this.resume = function() {
        this.paused = false;
    }

    this.pause = function() {
        this.paused = true;
    }
    
    this.resize = function(newWidth, newHeight) {}
    
    this.show = function() {
        this.hidden = false;
        this.canvas.fadeIn(200);
    }
    
    this.hide = function() {
        this.hidden = true;
        this.canvas.fadeOut(200);
    }
}