function Simulation(canvasName, rate) {
    Widget.call(this, canvasName);

    this.paused = false;

    this.particles = [];
    this.simEngine = new SimEngine(this.width, this.height, this.particles);

    var timeStamp = 0;
    var newTime = timeStamp;
    var curTime = timeStamp;
    
    var updateRate = rate;
    var updateTime = 1000.0 / updateRate;

    var selected = -1;

    var mouseX = 0;
    var mouseY = 0;

    this.stage.addEventListener("stagemousemove", function (ev) {
        mouseX = ev.stageX;
        mouseY = ev.stageY; 
    });

    var zoom = 0.0;

    var w = this.width;
    var h = this.height;

    this.canvas.mousewheel(function(event) {
        var d = event.deltaY;
        if (d < 0) {
            if (zoom > 0) {
                sim.stage.regX = mouseX-(w/2);
                sim.stage.regY = mouseY-(h/2);
                zoom -= 0.25;
            }
        } else {
            if (zoom < 1) {
                sim.stage.regX = mouseX-(w/2);
                sim.stage.regY = mouseY-(h/2);
                
                zoom += 0.25;
            }
        }

        sim.stage.scaleX = 1+zoom;
        sim.stage.scaleY = 1+zoom;
    });

    this.setSpeedConst = function(speedConst) {
        this.simEngine.speedConst = speedConst;
    }
    
    this.resize = function(newWidth, newHeight) {
        this.simEngine.setBounds(newWidth, newHeight);
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
    
    this.addParticle = function(x, y, mass, radius, style) {
        var particle = new Particle(x, y, radius, style);
        
        particle.mass = mass;
        
        var particles = this.particles;
        particle.addEventHandler("click", function (ev) {
            if (selected != -1) {
                particles[selected].deselect();
            }
                
            for (var i = 0; i < particles.length; i++) {
                if (particles[i].displayObj == ev.target) {
                    if (i != selected) {
                        selected = i;
                        particles[i].selected = true;
                    } else {
                        selected = -1;
                    }
                    break;
                }
            }
        });
                
        this.stage.addChild(particle.displayObj);
        this.particles.push(particle);
        
        return particle;
    }
    
    this.removeParticle = function(index) {
        this.stage.removeChild(this.particles[index].displayObj);
        this.particles.splice(index, 1);
    }

    this.loadParticles = function(toBeLoaded) {
        this.restart();

        for (var i = 0; i < toBeLoaded.length; i++) {
            var obj = toBeLoaded[i];
            var particle = this.addParticle(obj.x, obj.y, obj.mass, obj.radius, obj.style);

            particle.xVel = obj.xVel;
            particle.yVel = obj.yVel;
            particle.cOR = obj.cOR;
        }
    }
    
    this.saveParticles = function(saved) {
        for (var i = 0; i < this.particles.length; i++) {
            var obj = this.particles[i];
            var particle = new Particle(obj.x, obj.y, obj.radius, obj.style);
    
            particle.mass = obj.mass;
            particle.xVel = obj.xVel;
            particle.yVel = obj.yVel;
            
            particle.cOR = obj.cOR;
    
            saved.push(particle);
        }
    }
    
    this.removeSelected = function() {
        if (selected != -1) {
            this.removeParticle(selected);
            selected = -1;
        }
    }

    this.getSelected = function() {
        var sel = null;
        if (selected != -1) {
            sel = this.particles[selected];
        }
        return sel;
    }

    this.getSelectedID = function() {
        return selected;
    }
    
    this.init = function() {
        var b1 = this.addParticle(100, 100, 100, 10, "red");
        this.addParticle(121, 100, 100, 10, "red");
        this.addParticle(142, 100, 100, 10, "red");
        this.addParticle(163, 100, 100, 10, "red");
        var b2 = this.addParticle(10, 100, 100, 10, "blue");

        b2.xVel = 1;
    }
    
    this.restart = function () {
        this.stage.removeAllChildren();
        selected = -1;
        
        this.particles = [];
        this.simEngine = new SimEngine(this.width, this.height, this.particles);
    }
    
    this.draw = function () {
        var particles = this.particles;
        if (!this.paused) {
            curTime += 1000/refreshRate;
        
            if (newTime + updateTime < curTime) {
                timeStamp = curTime;
                if (enableInterpolation) {
                    for (var i = 0; i < particles.length; i++) {
                        particles[i].capture();
                    }
                }
                while (newTime + updateTime < curTime) {
                    this.simEngine.updateSimulation();
                    
                    newTime += updateTime;
                }
            }
        }
        
        var interpolation = Math.min(1.0, (curTime - timeStamp) / updateTime);

        for (var i = 0; i < particles.length; i++) {
            var obj = particles[i];
    
            var newX = obj.x;
            var newY = obj.y;
    
            if (enableInterpolation) {
                var diffX = obj.x - obj.lastX;
                var diffY = obj.y - obj.lastY;
    
                newX = obj.lastX + (interpolation * diffX);
                newY = obj.lastY + (interpolation * diffY);
            }
     
            obj.draw(newX, newY);
        }
        
       // this.stage.scaleX = this.renderData.zoom;
        //this.stage.scaleY = this.renderData.zoom;

        this.stage.update();
    }
}

Simulation.prototype = new Widget();