var widgets = [];

function Point2D(x, y) {
    this.x = x;
    this.y = y;
}

var gameRate = 0;

var gravity = 9.81 / 10;
var enableInterpolation = true;
var maxTracePositions = 30;

var touchRadius = 100;

var mouseDown = false;

var debugStr = "Debug: ";
var timeStamp = new Date().getTime();
var newTime = timeStamp;
var fpsTime = timeStamp;
var sim;
var graph;

function start() {
    var mousePos = new Point2D();

    gameRate = defaultGameRate;

    var fps = 0;
    var fpsCount = 0;

    sim = new Simulation("widget-canvas");
    graph = new Graph("graph-canvas");
    
    widgets.push(sim);
    widgets.push(graph);
    
    graph.attachSimulation(sim);
    
    for (var i = 0; i < widgets.length; i++) {
        widgets[i].init();
    }
    
    setInterval(tick, 1000.0 / refreshRate);
}

var fpsDiv = null;
enableDebug = true;

var fpsCount = 0;
var fpsTime = 0;

function tick() {
    var curTime = new Date().getTime();
    
    if (fpsDiv == null)
        fpsDiv = $("#fps-div");

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
        if (enableColData) {
            debugStr = "Fps: " + fps +
                   "<br /> Game rate: " + setColGreen(sim.gameRate) + " Hz" +
                   "<br /> Energy in system: " + setColGreen(graph.getEnergy()) + " kJ" +
                   "<br /> Number of objects: " + setColGreen(sim.objects.length) +
                   "<br /> Gravity enabled: "+dbgBool(enableGravity);
                   
            fpsDiv.html(debugStr);
        } else fpsDiv.html("");
    }
    
    for (var i = 0; i < widgets.length; i++) {
        widgets[i].draw();
    }
}