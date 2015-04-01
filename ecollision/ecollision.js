function ECollision(settings) {
    this.settings = settings;

    this.paused = false;

    this.engine = new SimEngine(settings.simulationWidth, settings.simulationHeight);

    this.simulationUI = new Simulation(settings.simulationCanvas, this.engine, this.settings);
    this.graphUI = new Graph(settings.graphCanvas, this.engine, 1/50, 5, this.settings);
    this.overlayUI = new Overlay(settings.overlayCanvas, this.simulationUI, this.settings);

    this.fps = 0;

    var widgets = [this.simulationUI, this.graphUI, this.overlayUI];

    var fpsCount = 0;
    var fps = 0;
    var fpsTime = 0;

    var newTime = curTime = 0;

    var updateRate = settings.updateRate;
    var updateTime = 1000.0 / updateRate;

    var refreshTime = 1000/settings.refreshRate;

    var interpolation = 0.0;

    var ecol = this; //so that i can refer to this object inside nested functions - javascript problem solved

    this.start = function() {
        for (var i = 0; i < widgets.length; i++) {
            widgets[i].init();
        }
        
        setInterval(this.tick, 1000.0 / settings.refreshRate);
    }

    this.restart = function() {
        for (var i = 0; i < widgets.length; i++) {
            widgets[i].restart();
        }
    }

    this.resume = function() {
        this.paused = false;
        
        for (var i = 0; i < widgets.length; i++) {
            widgets[i].resume();
        } 
    }

    this.pause = function() {
        this.paused = true;

        for (var i = 0; i < widgets.length; i++) {
            widgets[i].pause();
        } 
    }

    this.onTick = function() {};

    this.update = function() {
        var particles = ecol.engine.particles;

        curTime += refreshTime;
    
        if (newTime + updateTime < curTime) {
            timeStamp = curTime;
            if (settings.enableInterpolation) {
                for (var i = 0; i < particles.length; i++) {
                    particles[i].capture();
                }
            }
            while (newTime + updateTime < curTime) {
                ecol.engine.update();
                
                newTime += updateTime;
            }
        }
        interpolation = Math.min(1.0, (curTime - timeStamp) / updateTime);
    }
    
    this.tick = function() {
        if (!ecol.paused) {
            ecol.update();
        }

        var fpsCurTime = new Date().getTime();
        fpsCount++;

        if (fpsCurTime - fpsTime >= 1000) {
            ecol.fps = fpsCount;

            fpsCount = 0;
            fpsTime = fpsCurTime;
        }

        for (var i = 0; i < widgets.length; i++) {
            widgets[i].draw(interpolation);
        }

        ecol.onTick();
    }
}