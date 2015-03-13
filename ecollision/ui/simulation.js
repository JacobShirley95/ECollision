function Simulation(canvasName, rate) {
    Widget.call(this, canvasName);

    this.paused = false;

    this.simEngine = null;
    this.particles = [];
    
    var timeStamp = 0;
    var newTime = timeStamp;
    var curTime = timeStamp;
    
    var updateRate = rate;
    var updateTime = 1000.0 / updateRate;

    var selected = -1;

    this.setSpeed = function(rate) {
        this.simEngine.speedConst = rate/defaultGameRate;
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
        
        var objects = this.objects;
        particle.addEventHandler("click", function (ev) {
            if (selected != -1) {
                objects[selected].deselect();
            }
                
            for (var i = 0; i < objects.length; i++) {
                if (objects[i].displayObj == ev.target) {
                    if (i != selected) {
                        selected = i;
                        objects[i].selected = true;
                    } else {
                        selected = -1;
                    }
                    break;
                }
            }
        });
                
        this.stage.addChild(particle.displayObj);
        this.objects.push(particle);
        
        return particle;
    }
    
    this.removeParticle = function(index) {
        this.stage.removeChild(this.objects[index].displayObj);
        this.objects.splice(index, 1);
    }

    this.loadParticles = function(objects) {
        this.init();

        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            var particle = this.addParticle(obj.x, obj.y, obj.mass, obj.radius, obj.style);

            particle.xVel = obj.xVel;
            particle.yVel = obj.yVel;
            particle.cOR = obj.cOR;
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
            sel = this.objects[selected];
        }
        return sel;
    }

    this.getSelectedID = function() {
        return selected;
    }
    
    this.init = function() {
        selected = -1;
        
        this.stage.removeAllChildren();
        this.objects = [];
        
        this.simEngine = new SimEngine(this.width, this.height, this.objects);
    }
    
    this.restart = function () {
        this.init();
    }
    
    this.draw = function () {
        var objects = this.objects;
        if (!this.paused) {
            curTime += 1000/refreshRate;
        
            if (newTime + updateTime < curTime) {
                timeStamp = curTime;
                if (enableInterpolation) {
                    for (var i = 0; i < objects.length; i++) {
                        objects[i].capture();
                    }
                }
                while (newTime + updateTime < curTime) {
                    this.simEngine.updateSimulation();
                    
                    newTime += updateTime;
                }
            }
        }
        
        var interpolation = Math.min(1.0, (curTime - timeStamp) / updateTime);

        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
    
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