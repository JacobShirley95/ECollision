function Point2D(x, y) {
    this.x = x;
    this.y = y;
}

var sim;
var graph;

function Ecollision() {
    var widgets = [];

    var debugStr = "Debug: ";
    var fpsTime = new Date().getTime();

    this.start = function() {
        sim = new Simulation("widget-canvas", 50);
        graph = new Graph("graph-canvas", sim);
        
        widgets.push(sim);
        widgets.push(graph);
        
        for (var i = 0; i < widgets.length; i++) {
            widgets[i].init();
        }
        
        setInterval(this.tick, 1000.0 / refreshRate);
    }
    
    var fpsDiv = null;
    var ballInfo = null;
    
    var fpsCount = 0;
    var fps = 0;
    
    this.tick = function() {
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
                       "<br /> Game rate: " + setColGreen(sim.getUpdateRate()) + " Hz" +
                       "<br /> Energy in system: " + setColGreen(graph.getEnergy()) + " kJ" +
                       "<br /> Number of objects: " + setColGreen(sim.objects.length) +
                       "<br /> Gravity enabled: "+dbgBool(enableGravity);
                       
            fpsDiv.html(debugStr);
        } else fpsDiv.html("");
        
        var selected = sim.getSelected();
        if (selected != null) {
            var str = "<b>Index:</b> " + sim.getSelectedID() +
                      "<br /> <b>XVel:</b> " + Math.round(selected.xVel) + 
                      "<br /> <b>YVel:</b> " + Math.round(selected.yVel) + 
                      "<br /> <b>Mass:</b> " + selected.mass + 
                      "<br /> <b>Radius:</b> " + selected.radius +
                      "<br /> <b>Energy:</b> " + Math.round(selected.getEnergy());
    
            ballInfo.html(str);
        } else {
            ballInfo.html("");
        }
    
        for (var i = 0; i < widgets.length; i++) {
            widgets[i].draw();
        }
    }
}