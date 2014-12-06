var widgets = [];

function Point2D(x, y) {
    this.x = x;
    this.y = y;
}

var gameRate = 0;

var gravity = 9.81 / 100;
var enableInterpolation = true;
var maxTracePositions = 30;

var touchRadius = 100;

var mouseDown = false;

var debugStr = "Debug: ";
var timeStamp = new Date().getTime();
var newTime = timeStamp;
var fpsTime = timeStamp;
var sim;

function start() {
    var mousePos = new Point2D();

    gameRate = defaultGameRate;

    var fps = 0;
    var fpsCount = 0;

    sim = new Simulation("widget-canvas");
    
    widgets.push(sim);
    
    for (var i = 0; i < widgets.length; i++) {
        widgets[i].init();
    }
    
    setInterval(tick, 1000.0 / refreshRate);
}

function tick() {
    var curTime = new Date().getTime();

    var energy = 0.0;
    
    if (enableDebug) {
        fpsCount++;

        if (curTime - fpsTime >= 1000) {
            if (fpsCount < 24) {
                fps = setCol(fpsCount, "red");
            } else {
                fps = setCol(fpsCount, "green");
            }
            fpsCount = 0;
            fpsTime = curTime;
        }
        debugStr = "Fps: " + fps;/* +
                   "<br /> Running atdd: " + setColGreen(gameRate) + " Hz" +
                   "<br /> Energy in system: " + setColGreen(Math.round(energy / 1000)) + " kJ" +
                   "<br /> Zoom: " + setColGreen(renderData.zoom) + "x" +
                   "<br /> Number of objects: " + setColGreen(objects.length) +
                   "<br /> Gravity enabled: "+dbgBool(enableGravity);//*/
    }
    
    for (var i = 0; i < widgets.length; i++) {
        widgets[i].draw();
    }
}