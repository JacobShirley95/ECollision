function ECollision(settings) {
    this.settings = settings;

    this.paused = false;

    this.engine = new SimulationEngine(settings.simulation.simulationWidth, settings.simulation.simulationHeight, this.settings);

    this.simulationUI = new Simulation(settings.simulation.simulationCanvas, this.engine, this.settings);
    this.graphUI = new Graph(settings.graph.graphCanvas, this.engine, 1/50, 5, this.settings);
    this.overlayUI = new Overlay(settings.overlay.overlayCanvas, this.simulationUI, this.settings);

    this.fps = 0;

    var widgets = [this.simulationUI, this.graphUI, this.overlayUI];

    var fpsCount = 0;
    var fps = 0;
    var fpsTime = 0;

    var newTime = timeStamp = curTime = 0;

    var updateRate = settings.global.updateRate;
    var updateTime = 1000.0 / updateRate;

    var refreshTime = 1000/settings.global.refreshRate;

    var interpolation = 0.0;

    var thread = -1;

    var ecol = this; //so that i can refer to this object inside nested functions - javascript problem solved

    this.start = function() {
        for (var i = 0; i < widgets.length; i++) {
            widgets[i].init();
        }
        
        thread = setInterval(this.tick, 1000.0 / settings.global.refreshRate);
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

    this.stop = function() {
        if (thread != -1) {
            clearInterval(thread);

            thread = -1;
        }
    }

    this.getUpdateRate = function() {
        return updateRate;
    }
    
    this.getUpdateTime = function() {
        return updateTime;
    }
    
    this.setUpdateRate = function(rate) {
        updateRate = rate;
        updateTime = 1000.0 / updateRate;
    }

    this.setSpeedConst = function(speedConst) {
        this.engine.speedConst = speedConst;
    }

    this.onTick = function() {};

    this.update = function() {
        curTime += refreshTime;
    
        if (newTime + updateTime < curTime) {
            timeStamp = curTime;
            if (settings.global.enableInterpolation) {
                for (var i = 0; i < this.engine.numOfParticles(); i++) {
                    this.engine.getParticle(i).capture();
                }
            }
            while (newTime + updateTime < curTime) {
                this.engine.update();
                
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