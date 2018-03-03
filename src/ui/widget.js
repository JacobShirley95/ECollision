/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Widget;
export default (Widget = class Widget {
    constructor(canvasName) {
        this.canvasName = canvasName;
        this.canvas = $(`#${this.canvasName}`);
        
        this.width = this.canvas.width();
        this.height = this.canvas.height();

        this.hidden = false;

        this.stage = new createjs.Stage(this.canvasName);

        this.canvas.attr("width", this.width);
        this.canvas.attr("height", this.height);
    }

    init() {} 

    addEventListener(event, handler) {
        return this.stage.addEventListener(event, handler);
    }
    
    draw(interpolation) {}
    
    restart() {}
    
    stop() {} 

    resume() { 
        return this.paused = false;
    }

    pause() { 
        return this.paused = true;
    }
    
    resize(newWidth, newHeight) {
        this.width = newWidth;
        return this.height = newHeight;
    }
    
    show() { 
        this.hidden = false;
        return this.canvas.fadeIn(200);
    }
    
    hide() { 
        this.hidden = true;
        return this.canvas.fadeOut(200);
    }
});