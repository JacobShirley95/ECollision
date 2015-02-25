var widgets = [];

function Point2D(x, y) {
    this.x = x;
    this.y = y;
}


var debugStr = "Debug: ";
var fpsTime = new Date().getTime();
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
var ballInfo = null;

var fpsCount = 0;

function tick() {
    var curTime = new Date().getTime();
    
    if (fpsDiv == null && ballInfo == null) {
        fpsDiv = $("#fps-div");
        ballInfo = $("#ball-info");
    }

    if (enableColData) {
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
        debugStr = "Fps: " + fps +
                   "<br /> Game rate: " + setColGreen(sim.getGameRate()) + " Hz" +
                   "<br /> Energy in system: " + setColGreen(graph.getEnergy()) + " kJ" +
                   "<br /> Number of objects: " + setColGreen(sim.objects.length) +
                   "<br /> Gravity enabled: "+dbgBool(enableGravity);
                   
        fpsDiv.html(debugStr);
    } else fpsDiv.html("");
    
    var selected = sim.getSelected();
    if (selected != null) {
        var str = "Index " + sim.getSelectedID() +
                  "<br /> XVel " + selected.xVel + 
                  "<br /> YVel " + selected.yVel + 
                  "<br /> Mass " + selected.mass + 
                  "<br /> Radius " + selected.radius;

        ballInfo.html(str);
    } else {
        ballInfo.html("");
    }

    for (var i = 0; i < widgets.length; i++) {
        widgets[i].draw();
    }
}