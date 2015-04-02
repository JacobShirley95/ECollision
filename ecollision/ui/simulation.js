function Simulation(canvasName, engine, settings) {
    Widget.call(this, canvasName);

    this.engine = engine;
    this.engine.width = this.width;
    this.engine.height = this.height;

    var timeStamp = 0;
    var newTime = timeStamp;
    var curTime = timeStamp;
    
    var updateRate = settings.updateRate;
    var updateTime = 1000.0 / updateRate;

    var selected = -1;

    this.setSpeedConst = function(speedConst) {
        this.engine.speedConst = speedConst;
    }
    
    this.resize = function(newWidth, newHeight) {
        this.engine.setBounds(newWidth, newHeight);
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
        var particle = new Particle(x, y, radius, style, settings);
        
        particle.mass = mass;
        
        var engine = this.engine;
        particle.addEventHandler("click", function (ev) {
            var p = engine.getParticle(selected);

            if (selected != -1) {
                p.deselect();
            }
                
            for (var i = 0; i < engine.numOfParticles(); i++) {
                if (engine.getParticle(i).displayObj == ev.target) {
                    if (i != selected) {
                        selected = i;
                        engine.getParticle(i).selected = true;
                    } else {
                        selected = -1;
                    }
                    break;
                }
            }
        });
                
        this.stage.addChild(particle.displayObj);
        this.engine.addParticle(particle);
        
        return particle;
    }
    
    this.removeParticle = function(index) {
        this.stage.removeChild(this.engine.getParticle(index).displayObj);
        this.engine.removeParticle(index);
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
        for (var i = 0; i < this.engine.numOfParticles(); i++) {
            var obj = this.engine.getParticle(i);
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
            sel = this.engine.getParticle(selected);
        }
        return sel;
    }

    this.getSelectedID = function() {
        return selected;
    }
    
    this.init = function() {
    }
    
    this.restart = function () {
        this.stage.removeAllChildren();
        selected = -1;
        this.engine.reset();
    }

    this.draw = function (interpolation) {
        for (var i = 0; i < this.engine.numOfParticles(); i++) {
            var obj = this.engine.getParticle(i);

            var newX = obj.x;
            var newY = obj.y;
    
            if (settings.enableInterpolation) {
                var diffX = obj.x - obj.lastX;
                var diffY = obj.y - obj.lastY;
    
                newX = obj.lastX + (interpolation * diffX);
                newY = obj.lastY + (interpolation * diffY);
            }
     
            obj.draw(newX, newY);
        }

        this.stage.update();
    }
}

Simulation.prototype = new Widget();