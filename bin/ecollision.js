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
function SimulationEngine(width, height, settings) {
    this.width = width;
    this.height = height;
    
    var particles = [];

    this.setBounds = function(width, height) {
        this.width = width;
        this.height = height;
    }

    this.reset = function() {
        particles = [];
    }

    this.addParticle = function(particle) {
        if (particles.length < settings.global.maxParticles) {
            particle.index = particles.length;
            particles.push(particle);
        } else {
            throw "ERROR: Number of particles exceeds the maximum value set.";
        }
    }

    this.removeParticle = function(index) {
        particles.splice(index, 1);
    }

    this.getParticle = function(index) {
        return particles[index];
    }

    this.numOfParticles = function() {
        return particles.length;
    }
    
    //Collision class that stores which objects collided and a time constant of how much to seperate them by.
    function Collision() {
        this.time = 0.0;
        this.particle = null;
        this.particle2 = null;
    }

    //This detects if there is an edge collision.
    this.edgeCollision = function (particle, rebound) {
        var cOR = particle.cOR;

        //If the particle is outside the width set, it will be placed back inside
        if (particle.x + particle.radius >= this.width) {
            if (rebound) {
                //The particle may lose energy if it's coefficient of restitution is less than 1.
                particle.xVel *= -cOR;
                particle.yVel *= cOR;
            } else {
                particle.x = this.width - particle.radius;
            }
        } else if (particle.x - particle.radius <= 0) {
            if (rebound) {
                particle.xVel *= -cOR;
                particle.yVel *= cOR;
            } else {
                particle.x = particle.radius;
            }
        }
        
        //If the particle is outside the height set, it will be placed back inside
        if (particle.y + particle.radius >= this.height) {
            if (rebound) {
                particle.xVel *= cOR;
                particle.yVel *= -cOR;
            } else {
                particle.y = this.height - particle.radius;
            }
        } else if (particle.y - particle.radius <= 0) {
            if (rebound) {
                particle.xVel *= cOR;
                particle.yVel *= -cOR;
            } else {
                particle.y = particle.radius;
            }
        } 
    }
    
    //This functions checks for a collision and returns true or false if yes. It also calculates the required amount of time to seperate the particles.
    this.collide = function(particle, particle2, collision) {
        //Take the distances between the particles on the x and y axes
        var dX = particle2.x - particle.x;
        var dY = particle2.y - particle.y;
        
        //Calculate the square of the distance
        var sqr = (dX * dX) + (dY * dY);
        var r = particle2.radius + particle.radius;
        
        //Could sqrt to get the distance, but there's no need because the otherside would also have to be sqrted
        if (sqr < r * r) {
            //Now to get the time constant between the last update and this update at which the particles would have collided perfectly
            //Put into pvectors as we need to get the dot products
            var pDiff = new PVector(particle.x - particle2.x, particle.y - particle2.y);
            var vDiff = new PVector(particle.xVel - particle2.xVel, particle.yVel - particle2.yVel);
            
            //The following can be derived thus:
            //          At the time of a perfect collision:
            //              let dx = particle2_currentX - particle1_currentX
            //              let dy = particle2_currentY - particle1_currentY
            //
            //              let diffVelocityX = particle2_velocityX-particle1_velocityX
            //              let diffVelocityY = particle2_velocityY-particle1_velocityY
            //
            //              let particle1_xFinal = particle1_currentX - (particle1_velocityX * time)
            //              let particle1_yFinal = particle1_currentY - (particle1_velocityY * time)
            //
            //              let particle2_xFinal = particle2_currentX - (particle2_velocityX * time)
            //              let particle2_yFinal = particle2_currentY - (particle2_velocityY * time)
            //
            //          We need to solve for time:
            //              let diffX = particle2_xFinal-particle1_xFinal
            //              let diffY = particle2_yFinal-particle1_yFinal
            //
            //          Rearranging and subbing-in this gives:
            //              diffX = particle2_currentX - (particle2_velocityX * time) - particle1_currentX - (particle1_velocityX * time) 
            //                    = (particle2_currentX - particle1_currentX) - time*(particle2_velocityX-particle1_velocityX) 
            //                    = dx - time*diffVelocityX
            //
            //              diffY = particle2_currentY - (particle2_velocityY * time) - particle1_currentY - (particle1_velocityY * time) 
            //                    = (particle2_currentY - particle1_currentY) - time*(particle2_velocityY-particle1_velocityY)
            //                    = dy - time*diffVelocityY          
            //
            //          Now it is just like a collision check, as above, except this time we can solve for time:
            //              let sqr = sqr(diffX) + sqr(diffY) 
            //                      = sqr(dx - time*diffVelocityX) + sqr(dy - time*diffVelocityY)
            //
            //          Now to expand the brackets:
            //              sqr = sqr(dx) - 2*time*diffVelocityX*dx + sqr(time)*sqr(diffVelocityX) + sqr(dy) - 2*time*diffVelocityY*dy + sqr(time)*sqr(diffVelocityY)
            //              
            //          We're trying to find time, and or a perfect collision, sqr must equal the sum of the radii squared
            //          So our quadratic equation is:
            //              let radiiSqred = sqr(particle1_radius+particle2_radius)
            //
            //              sqr = a*sqr(time) + b*time + c-radiiSqred = 0
            //              a = sqr(diffVelocityX)+sqr(diffVelocityY) (NOTE: dotProduct as below)
            //              b = -2*(dx*diffVelocityX + diffVelocityY*dy) (NOTE: dotProduct as below)
            //              c = sqr(dx)+sqr(dy) - radiiSqred
            //          
            //          We then use the quadratic formula (-b +- sqrt(b*b - 4*a*c))/(2*a) to calculate time
            var a = vDiff.dotProduct(vDiff);
            var b = -2 * vDiff.dotProduct(pDiff);
            var c = (pDiff.dotProduct(pDiff)) - (r * r);
    
            var discr = (b * b) - (4 * a * c);
            var t = 0.0;
            var t2 = 0.0;
            if (discr >= 0) {
                t = (-b - Math.sqrt(discr)) / (2 * a);
                t2 = (-b + Math.sqrt(discr)) / (2 * a);
            }

            if (t > 0.0 && t <= 1.0)
                collision.time = t;
            else if (t2 > 0.0 && t2 <= 1.0)
                collision.time = t2;
            else
                collision.time = 1.0;
    
            return true;
        }
        return false;
    }

    //This function splits particle1's velocity into parallel and perpendicular components.
    function splitVelocity(particle1, particle2) {
        //The overall process of visualising how this works is:
        //      1. Imagine the collision happening such that particle1's velocity is rotated so that it is in one dimension, or the x-axis
        //      2. Then calculate its parallel and perpendicular components when it collides.
        //      3. Finally rotate these components back by the same amount.
        //
        //Store the current velocity in a vector structure
        var velocity = new PVector(particle1.xVel, particle1.yVel);

        //Default angle
        var a = Math.PI / 2;
        
        //Calculate the angle of the velocity
        if (particle1.xVel !== 0) {
            a = Math.atan(particle1.yVel / particle1.xVel);
        }

        //Calculate the magnitude as if it were on the x-axis only. This was originally part of my rotate function.
        //See math/pector.js for similarities
        var magnitude = (particle1.xVel * Math.cos(-a) - particle1.yVel * Math.sin(-a)) * particle1.cOR;
        
        var dx = particle1.x - particle2.x;
        var dy = particle1.y - particle2.y;
        
        //Calculate the position angle
        var ang = 0;
        if (dx !== 0) {
            ang = Math.atan(dy / dx);
        } else {
            ang = Math.atan(dy / (dx - 0.00001));
        }

        //This is a simplification of multiple cosines and sines using trig identities. It is essentially doing stages 2 and 3 as stated above.
        velocity.x = magnitude * (Math.cos(ang - a));
        velocity.y = magnitude * (Math.sin(ang - a));
    
        return velocity;
    }
    
    //This function actually handles the collision between two particles.
    this.handleCollision = function (collision) {
        var particle = collision.particle;
        var particle2 = collision.particle2;
        
        //Split the velocities into parallel and perpendicular components. See "splitVelocity" above.
        var thisVel = splitVelocity(particle, particle2);
        var particleVel = splitVelocity(particle2, particle);
        
        //Finally do some real physics. This calculates the new velocities of the parallel components as if they were one-dimensional.
        var newV = ((thisVel.x * (particle.mass - particle2.mass)) + (2 * particle2.mass * particleVel.x)) / (particle.mass + particle2.mass);
        var newV2 = ((particleVel.x * (particle2.mass - particle.mass)) + (2 * particle.mass * thisVel.x)) / (particle.mass + particle2.mass);
        
        //Calculate the angle between the particles
        var ang = Math.atan((particle.y - particle2.y) / (particle.x - particle2.x));
    
        var cosA = Math.cos(ang);
        var sinA = Math.sin(ang);

        //Then these new velocityies are split further so they fit the Cartesian coordinate system. They are then added to the remaining velocity from the perpendicular components
        var x1 = (newV * cosA) + (thisVel.y * sinA);
        var y1 = (newV * sinA) - (thisVel.y * cosA);
 
        var x2 = (newV2 * cosA) + (particleVel.y * sinA);
        var y2 = (newV2 * sinA) - (particleVel.y * cosA);

        //Seperate the particles. See "seperateObjects" below.
        this.seperateObjects(collision, particle, particle2);
    
        //Finally give each particle their new velocities.
        particle.xVel = x1;
        particle.yVel = y1;
    
        particle2.xVel = x2;
        particle2.yVel = y2;
    }

    //This function seperates the particles after collision.
    this.seperateObjects = function(collision, particle, particle2) {
        //Add a small extra amount of time so that the particles can never get stuck on each other
        var t = collision.time + (0.001 * collision.time);

        if (t < 1.0) {
            //Pull both particles back by the perfect collision time. See "collide" function
            particle.x -= particle.xVel * settings.global.speedConst * t;
            particle.y -= particle.yVel * settings.global.speedConst * t;
    
            particle2.x -= particle2.xVel * settings.global.speedConst * t;
            particle2.y -= particle2.yVel * settings.global.speedConst * t;
        } else {
            //Failsafe method of seperating particles

            //First calculate the overlap
            var dX = particle2.x - particle.x;
            var dY = particle2.y - particle.y;
    
            var sqr = (dX * dX) + (dY * dY);
            
            var overlap = particle2.radius - Math.abs(Math.sqrt(sqr) - particle.radius) + 0.1;
    
            var vel1 = new PVector(particle.xVel, particle.yVel).getMagnitudeNS()+0.0001;
            var vel2 = new PVector(particle2.xVel, particle2.yVel).getMagnitudeNS()+0.0001;

            //Total velocity
            var vT = vel1 + vel2;

            //Work out the first propotion for movement
            var i = vel1 / vT;
    
            ang = Math.atan2(particle.y - particle2.y, particle.x - particle2.x);
            
            //Move particle
            particle.x += overlap * Math.cos(ang) * i;
            particle.y += overlap * Math.sin(ang) * i;
            
            //Work out other proportion for movement
            i = 1 - i;
    
            particle2.x -= overlap * Math.cos(ang) * i;
            particle2.y -= overlap * Math.sin(ang) * i;
        }
    }

    //This function causes the particles to update and react to each other. It is the heart of the system.
    this.update = function () {
        //Loop through the particles, make sure they are not overlapping with the edges, then update their position.
        for (var i = 0; i < particles.length; i++) {
            var particle = particles[i];
            
            this.edgeCollision(particle, true);
            particle.update();
        }
    
        var colObjects = [];

        //Loop through the particles, check for collisions once between pairs of particles. 
        //If colliding, add them to a collision array
        for (var i = 0; i < particles.length; i++) {
            var particle = particles[i];
    
            for (var i2 = i + 1; i2 < particles.length; i2++) {
                var particle2 = particles[i2];
    
                var collision = new Collision();
                if (this.collide(particle, particle2, collision)) {
                    collision.particle = particle;
                    collision.particle2 = particle2;
                    colObjects.push(collision);
                }
            }
        }
        //Loop through the collision array and sort out which one happened first
        colObjects.sort(function (a, b) {
            return a.time < b.time;
        });
        
        //Handle the collisions stored in the collision array. See "handleCollision" above
        for (var i = 0; i < colObjects.length; i++) {
            var collision = colObjects[i];

            this.handleCollision(collision);
        }

        //Finally check for an edge collision again but do not rebound the particle
        for (var i = 0; i < particles.length; i++) {
            var particle = particles[i];
    
            this.edgeCollision(particle, false);
        }
    }
}
function Point2D(x, y) {
    this.x = x;
    this.y = y;
}
function PVector(x, y) {
    this.x = x;
    this.y = y;

    this.getMagnitude = function () {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }

    this.getMagnitudeNS = function () {
        return (this.x * this.x) + (this.y * this.y);
    }

    this.dotProduct = function (vec) {
        return (this.x * vec.x) + (this.y * vec.y);
    }

    this.getNormal = function () {
        return new PVector(-this.y, this.x);
    }

    this.rotate = function (angle) {
        var x2 = this.x;
        var y2 = this.y;

        this.x = x2 * Math.cos(angle) - y2 * Math.sin(angle);
        this.y = x2 * Math.sin(angle) + y2 * Math.cos(angle);
    }
}
function Particle(x, y, radius, style, settings) {
    PhysicsObject.call(this, x, y, 10);

    this.radius = radius;
    this.style = style;
    this.cOR = 1.0;
    this.selected = false;

    var pastPositions = [];
    var curPos = 0;
    
    this.draw = function (x, y) {
        this.displayObj.x = x;
        this.displayObj.y = y;
        
        var graphics = this.displayObj.graphics;
        
        graphics.clear();

        if (this.selected) {
            var len = pastPositions.length;
            for (var i = 1; i < len; i++) {
                var p = pastPositions[(i + curPos) % len];
                var px = p.x-x;
                var py = p.y-y;

                var r_a = i / len;

                var col = "rgba(100, 100, 100, "+r_a+")";
                graphics.beginStroke(col).drawCircle(px, py, this.radius).endStroke();
            }

            graphics.beginStroke("red").setStrokeStyle(3).drawCircle(0, 0, this.radius).endStroke();
        }

        graphics.beginFill(this.style).drawCircle(0, 0, this.radius).endFill();

        if (this.selected || settings.global.showVelocities) {
            graphics.beginStroke("red").setStrokeStyle(3).moveTo(0, 0).lineTo(this.xVel*settings.global.updateRate, this.yVel*settings.global.updateRate).endStroke();
        }
    };

    this.select = function() {
        this.selected = true;
    }
    
    this.deselect = function() {
        this.selected = false;
        pastPositions = [];
    }
    
    this.update = function () {
        this.x += this.xVel*settings.global.speedConst;
        this.y += this.yVel*settings.global.speedConst;

        var len = pastPositions.length;
        if (this.selected) {
            curPos++;
            curPos %= settings.global.maxTraceLength;
            if (len < settings.global.maxTraceLength) {
                pastPositions.push(new Point2D(this.x, this.y));
            } else {
                pastPositions[curPos] = new Point2D(this.x, this.y);
            }
        }
    };

    this.copy = function() {
       var p = new Particle(this.x, this.y, this.radius, this.style, settings);

       p.index = this.index;
       p.cOR = this.cOR;
       p.mass = this.mass;
       p.xVel = this.xVel;
       p.yVel = this.yVel;

       return p;
    }
}

Particle.prototype = new PhysicsObject();
function PhysicsObject(x, y, mass) {
    this.x = x;
    this.y = y;

    this.lastX = this.x;
    this.lastY = this.y;

    this.xVel = 0.0;
    this.yVel = 0.0;

    this.mass = mass;
    
    this.displayObj = new createjs.Shape();
    this.displayObj.x = this.x;
    this.displayObj.y = this.y;

    //private function
    this.capture = function () {
        this.lastX = this.x;
        this.lastY = this.y;
    };

    this.update = function () {
        this.x += this.xVel*speedConst;
        this.y += this.yVel*speedConst;
    };

    this.addEventHandler = function (event, handler) {
        this.displayObj.addEventListener(event, handler);
    }
    
    this.getEnergy = function() {
        return 0.5 * this.mass * ((this.xVel*this.xVel) + (this.yVel*this.yVel));
    }
    
    this.draw = function (x, y) {
        this.displayObj.x = x;
        this.displayObj.y = y;
    }
}
function ECollisionSettings() {
	this.global = {
		refreshRate: 60,
		updateRate: 60,
		showVelocities: false,
		enableInterpolation: true,
		maxTraceLength: 30,
		speedConst: 1.0,
		maxParticles: 20,
		minRadius: 5,
		maxRadius: 30,
		errorTime: 5000
	};
	this.simulation = {	
		simulationWidth: 1000,
		simulationHeight: 1000,
		simulationCanvas: "simulation-canvas"
	};
	this.graph = {
		graphCanvas: "graph-canvas",
		graphScaleX: 1/50,
		graphScaleY: 5,
		graphZoomFactor: 1.25,
		graphMinZoomIndex: 5,
		graphMaxZoomIndex: 5
	}
	this.overlay = {
		overlayCanvas: "overlay-canvas"
	};
}
function Graph(canvasName, engine, scaleX, scaleY, settings) {
    Widget.call(this, canvasName);
    
    this.scaleX = scaleX;
    this.scaleY = scaleY;

    this.x = 0;
    this.y = 0;

    this.engine = engine;
    
    var graph = new createjs.Shape();

    var offsetX = 0.0;
    var offsetY = 0.0;

    var userY = 0;
    
    var data = [];
    var start = 0;
    var maxLen = 150;
    
    var updated = false;

    var currX = 0;
    var currY = 0;

    var zoomIndex = 0;
    
    this.init = function() {
        var xAxis = new createjs.Shape();
        var yAxis = new createjs.Shape();
    
        xAxis.graphics.beginStroke("red").moveTo(this.x, this.height).lineTo(this.width, this.height);
        yAxis.graphics.beginStroke("red").moveTo(this.x, this.y).lineTo(this.x, this.height);
        
        this.stage.addChild(xAxis);
        this.stage.addChild(yAxis);
        
        this.stage.addChild(graph);
        
        this.updateData();
    }
    
    this.draw = function (interpolation) {
        if (this.engine != null) {
            var g = graph.graphics;
            
            g.clear();
            
            var length = data.length-1;
            var total = 0;

            for (var j = 0; j < length-1; j++) {
                if (updated) {
                    updated = false;
                    return;
                }
                
                total += data[j].y;
                
                //calculate offsetted index for point at index j
                var i = (start+j)%length;
                var i2 = (start+j+1)%length;
                
                var x2 = (data[i].x*this.scaleX)-offsetX;
                var y2 = (data[i].y*this.scaleY)+offsetY+userY;
                
                //if second x value is larger than width, move graph along
                if (x2 > this.width) {
                    offsetX += x2-this.width;
                }
        
                var x1 = (data[i].x*this.scaleX)-offsetX;
                var y1 = (data[i].y*this.scaleY)+offsetY+userY;
                
                var x3 = (data[i2].x*this.scaleX)-offsetX;
                var y3 = (data[i2].y*this.scaleY)+offsetY+userY;
                
                g.beginStroke("red").moveTo(this.x+x1, this.y+this.height-y1).lineTo(this.x+x3, this.y+this.height-y3);
            }
            
            if (!this.paused) {
                currX += 1000/settings.global.updateRate;
                currY = this.getEnergy();
                
                this.addData(currX, currY);
            }
                
            var dataY = total/data.length;
            var targetY = this.height/2;
        
            offsetY = targetY-(dataY*this.scaleY);
            
            this.stage.update();
        }
    }

    this.restart = function() {
        data = [];
        start = 0;
        currX = currY = 0;
        offsetX = offsetY = 0;
        updated = true;
    }
    
    this.calibrate = function() {
        userY = 0;
    }
    
    this.zoomIn = function() {
        if (zoomIndex < settings.graph.graphMaxZoomIndex) {
            this.scaleX *= settings.graph.graphZoomFactor;
            this.scaleY *= settings.graph.graphZoomFactor;
            
            offsetX *= this.scaleX;
            offsetY *= this.scaleY;
            
            this.updateData();

            zoomIndex++;
        } else throw("ERROR: Maximum zoom reached");
    }
    
    this.zoomOut = function() {
        if (zoomIndex > -settings.graph.graphMinZoomIndex) {
            this.scaleX /= settings.graph.graphZoomFactor;
            this.scaleY /= settings.graph.graphZoomFactor;
            
            offsetX *= this.scaleX;
            offsetY *= this.scaleY;

            this.updateData();

            zoomIndex--;
        } else throw("ERROR: Minimum zoom reached");
    }
    
    this.moveUp = function() {
        userY -= 5;
    }
    
    this.moveDown = function() {
        userY += 5;
    }
    
    this.addData = function(x, y) {
        if (data.length > maxLen) {
            var s = start;
 
            start = (start + 1)%maxLen;

            data[s] = new Point2D(x, y);
        } else {
            data.push(new Point2D(x, y));
        }
    }
    
    this.updateData = function() {
        var data2 = [];

        maxLen = Math.round(this.width/((1000/settings.global.updateRate)*this.scaleX))+5;

        var aLen = data.length-1;
        var diff = 0;
        
        if (aLen > maxLen) {
            diff = aLen-maxLen;
        }
        
        for (var j = diff; j < aLen; j++) {
            var i = (start+j)%aLen;
            data2.push(data[i]);
        }
        
        updated = true;
        start = 0;
        
        data = data2;
    }
    
    this.getEnergy = function() {
        var energy = 0.0;

        for (var i = 0; i < this.engine.numOfParticles(); i++) {
            energy += this.engine.getParticle(i).getEnergy();
        }
        
        return Math.round(energy/1000);
    }
}

Graph.prototype = new Widget();
function Overlay(canvasName, simulation, settings) {
    Widget.call(this, canvasName);
    this.hide();

    var INDEX_PLACE = 0;
    var INDEX_VELOCITY = 1;
    var INDEX_MODIFY = 2;

    var MODE_ADD = 0;
    var MODE_EDIT = 1;

    var index = 0;

    var mode = -1;
    
    var mouseX = crossX = this.width/2;
    var mouseY = crossY = this.height/2;
    
    var velocityLine = new createjs.Shape();
    var infoText = new createjs.Text("", "bold 15px Arial");
    var errorText = new createjs.Text("", "bold 15px Arial", "red");
    var errorTimer = 0;
    var showError = false;

    var modeText = new createjs.Text("", "bold 15px Arial");
    modeText.x = (this.width/2)-40;
    modeText.y = 10;

    var freePlace = false;
    var copyPlace = false;

    var lastX = 0;
    var lastY = 0;

    var tempObject = null;

    function gcd(a, b) {
        if ( ! b) {
            return a;
        }
        return gcd(b, a % b);
    }

    var interval = gcd(this.width, this.height);

    var overlay = this; //so that i can refer to this object inside nested functions - javascript problem solved
    
    function handleMouseWheel(ev) {
        var d = ev.deltaY;
        if (d < 0) {
            if (tempObject.radius > settings.global.minRadius) {
                tempObject.radius -= 1;
            }
        } else {
            if (tempObject.radius < settings.global.maxRadius) {
                tempObject.radius += 1;
            }
        }
    }

    this.canvas.mousewheel(handleMouseWheel);

    this.resize = function(width, height) {
        interval = gcd(this.width, this.height);
    }
    
    $(document).keydown(function(event) {
        freePlace = event.ctrlKey;
        copyPlace = event.shiftKey;
    });
    
    $(document).keyup(function(event) {
        freePlace = false;
        copyPlace = false;
    });
    
    this.canvas.bind('contextmenu', function(e){
        return false;
    }); 

    this.init = function() {
        this.stage.removeAllChildren();

        mouseX = crossX = this.width/2;
        mouseY = crossY = this.height/2;

        this.stage.addChild(modeText);
    }

    function handleMouseMove(ev) {
        mouseX = crossX = ev.stageX;
        mouseY = crossY = ev.stageY;
        
        if (!freePlace) {
            var gridX = Math.round(mouseX/interval);
            var gridY = Math.round(mouseY/interval);
            
            crossX = gridX*interval;
            crossY = gridY*interval;
        }
        
        switch (index) {
            case INDEX_PLACE:
                velocityLine.x = crossX;
                velocityLine.y = crossY;
                
                if (tempObject != null) {
                    tempObject.x = crossX;
                    tempObject.y = crossY;
                }
                
                infoText.x = crossX;
                infoText.y = crossY;

                break;
            case INDEX_VELOCITY:
                var g = velocityLine.graphics;
            
                var dx = crossX-velocityLine.x;
                var dy = crossY-velocityLine.y;
                
                infoText.x = velocityLine.x + (dx/2);
                infoText.y = velocityLine.y + (dy/2);
                infoText.text = Math.round(Math.sqrt(dx*dx + dy*dy)) + " px/s";
                
                tempObject.xVel = dx/settings.global.updateRate;
                tempObject.yVel = dy/settings.global.updateRate;
                
                g.clear().beginStroke("red").setStrokeStyle(3).moveTo(0, 0).lineTo(dx, dy);

                break;
            case INDEX_MODIFY:
                for (var i = 0; i < simulation.engine.numOfParticles(); i++) {
                    var p = simulation.engine.getParticle(i);
                    
                    var dx = p.x-mouseX;
                    var dy = p.y-mouseY;
                    if (dx*dx + dy*dy <= p.radius*p.radius) {
                        p.select();
                        
                        tempObject = p;
                    } else {
                        p.deselect();
                    }
                }

                break;
        }
    }
    
    this.stage.addEventListener("stagemousemove", handleMouseMove);

    function handleClick(ev) {
        if (ev.button == 2 && index != INDEX_MODIFY) {
            switch (index) {
                case INDEX_PLACE:
                    overlay.end();
                    break;

                case INDEX_VELOCITY:
                    break;
            }
            reset();
        } else {
            switch(index) {
                case INDEX_PLACE:
                    velocityLine.graphics.clear();
                
                    overlay.stage.addChild(velocityLine);
                    overlay.stage.addChild(infoText);

                    index = INDEX_VELOCITY;

                    break;
                case INDEX_VELOCITY:
                    try {
                        var p = simulation.addParticle(tempObject.x, tempObject.y, tempObject.mass, tempObject.radius, tempObject.style);
                    
                        p.xVel = tempObject.xVel;
                        p.yVel = tempObject.yVel;
                        p.cOR = tempObject.cOR;
                        
                        overlay.stage.removeChild(velocityLine);
                        overlay.stage.removeChild(infoText);

                        tempObject.xVel = tempObject.yVel = 0;

                        if (mode == MODE_EDIT && !copyPlace) {
                            index = INDEX_MODIFY;
                            overlay.stage.removeChild(tempObject.displayObj);
                        } else 
                            index = INDEX_PLACE;
                    } catch (e) {
                        errorText.text = e;
                        errorText.x = overlay.width-(errorText.getMeasuredWidth());
                        errorText.y = overlay.height/2;
                        overlay.stage.addChild(errorText);
                        errorTimer = settings.global.errorTime;
                        showError = true;
                    }
                    break;
                case INDEX_MODIFY:
                    tempObject.displayObj.dispatchEvent("click");
                    if (ev.button == 2) {
                        simulation.removeSelected();
                    } else {
                        var selected = tempObject;

                        tempObject = selected.copy();

                        lastX = selected.x;
                        lastY = selected.y;

                        overlay.stage.addChild(tempObject.displayObj);

                        if (!copyPlace)
                            simulation.removeSelected();

                        index = INDEX_PLACE;
                    }

                    break;
            }
        }
        ev.stopPropagation();
    }

    this.canvas.mousedown(handleClick);
    
    this.draw = function(interpolation) {
        if (!this.hidden) {
            if (tempObject != null) {
                tempObject.draw(tempObject.x, tempObject.y);
            }

            if (showError) {
                errorTimer -= 1000/settings.global.updateRate;
                if (errorTimer <= 0) {
                    showError = false;

                    this.stage.removeChild(errorText);
                }
            }
                
            this.stage.update();
        }
    }
    
    function reset() {
        if (mode == MODE_EDIT) {
            var p = simulation.addParticle(lastX, lastY, tempObject.mass, tempObject.radius, tempObject.style);

            p.xVel = tempObject.xVel;
            p.yVel = tempObject.yVel;

            overlay.removeChild(tempObject.displayObj);
            tempObject = null;

            index = INDEX_MODIFY;
        } else {
            overlay.stage.removeChild(velocityLine);
            overlay.stage.removeChild(infoText);
            index = INDEX_PLACE;
        }
    }
    
    this.beginAdd = function(mass, cOR, style) {
        this.show();
        this.init();

        tempObject = new Particle(crossX, crossY, 25, style, settings);
        tempObject.mass = mass;
        tempObject.cOR = cOR;
        
        infoText.x = mouseX;
        infoText.y = mouseY;

        this.stage.addChild(tempObject.displayObj);

        modeText.text = "Mode: Add";

        index = INDEX_PLACE;
        mode = MODE_ADD;
    }
    
    this.beginEdit = function() {
        this.show();
        this.init();

        modeText.text = "Mode: Edit";

        index = INDEX_MODIFY;
        mode = MODE_EDIT;
    }

    this.end = function() {
        this.hide();
        this.stage.removeAllChildren();
        if (tempObject != null) {
            tempObject = null;
        }
        mode = -1;

        freePlace = false;
        copyPlace = false;
    }

    this.getCurrentParticle = function() {
        return tempObject;
    }

    this.getMode = function() {
        return mode;
    }
}

Overlay.prototype = new Widget();
function Simulation(canvasName, engine, settings) {
    Widget.call(this, canvasName);

    this.engine = engine;
    this.engine.width = this.width;
    this.engine.height = this.height;

    var selected = -1;

    this.resize = function(newWidth, newHeight) {
        this.engine.setBounds(newWidth, newHeight);
    }
    
    this.addParticle = function(x, y, mass, radius, style) {
        var particle = new Particle(x, y, radius, style, settings);
        
        particle.mass = mass;
        
        var engine = this.engine;
        var t = this;
        particle.addEventHandler("click", function (ev) {
            var p = engine.getParticle(selected);

            if (selected != -1) {
                p.deselect();
                t.onDeselect(p);
            }
                
            for (var i = 0; i < engine.numOfParticles(); i++) {
                p = engine.getParticle(i);
                if (p.displayObj == ev.target) {
                    if (i != selected) {
                        t.onSelect(p);
                        selected = i;
                        p.selected = true;
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
    
    this.onSelect = function(particle) {
        
    }
    
    this.onDeselect = function(particle) {
        
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
    
            saved.push(obj.copy());
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
    
            if (settings.global.enableInterpolation) {
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
function Widget(canvasName) {
    this.hidden = false;
    
    this.canvasName = canvasName;
    this.canvas = $("#"+canvasName);
    
    this.width = this.canvas.width();
    this.height = this.canvas.height();
    
    this.stage = new createjs.Stage(canvasName);

    this.canvas.attr("width", this.width);
    this.canvas.attr("height", this.height);

    this.init = function() {}

    this.addEventListener = function(event, handler) {
        this.stage.addEventListener(event, handler);
    }
    
    this.draw = function (interpolation) {}
    
    this.restart = function () {}
    
    this.stop = function() {}

    this.resume = function() {
        this.paused = false;
    }

    this.pause = function() {
        this.paused = true;
    }
    
    this.resize = function(newWidth, newHeight) {}
    
    this.show = function() {
        this.hidden = false;
        this.canvas.fadeIn(200);
    }
    
    this.hide = function() {
        this.hidden = true;
        this.canvas.fadeOut(200);
    }
}