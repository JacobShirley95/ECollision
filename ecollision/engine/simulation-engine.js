function SimulationEngine(width, height, settings) {
    this.width = width;
    this.height = height;
    
    particles = [];

    this.edgeCollision = function (particle, rebound) {
        var cOR = particle.cOR;

        if (particle.x + particle.radius >= this.width) {
            if (rebound) {
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

    this.reset = function() {
        particles = [];
    }

    this.addParticle = function(particle) {
        if (particles.length < settings.maxParticles) {
            particle.index = particles.length;
            particles.push(particle);
        } else {
            throw "ERROR: Number of balls exceeds the maximum value set.";
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
    
    function Collision() {
        this.time = 0.0;
        this.object = null;
        this.object2 = null;
    }
    
    this.collide = function(object, object2, collision) {
        //Take the distances between the objects on the x and y axes
        var dX = object2.x - object.x;
        var dY = object2.y - object.y;
        
        //Calculate the square of the distance
        var sqr = (dX * dX) + (dY * dY);
        var r = object2.radius + object.radius;
        
        //Could sqrt to get the distance, but there's no need because the otherside would also have to be sqrted
        if (sqr < r * r) {
            //Now to get the time constant between the last update and this update at which the objects would have collided perfectly
            //Put into pvectors as we need to get the dot products
            var pDiff = new PVector(object.x - object2.x, object.y - object2.y);
            var vDiff = new PVector(object.xVel - object2.xVel, object.yVel - object2.yVel);
            
            //The following can be derived thus:
            //          At the time of a perfect collision:
            //              let dx = obj2_currentX - obj1_currentX
            //              let dy = obj2_currentY - obj1_currentY
            //
            //              let dVelX = obj2_velocityX-obj1_velocityX
            //              let dVelY = obj2_velocityY-obj1_velocityY
            //
            //              let obj1_xFinal = obj1_currentX - (obj1_velocityX * time)
            //              let obj1_yFinal = obj1_currentY - (obj1_velocityY * time)
            //
            //              let obj2_xFinal = obj2_currentX - (obj2_velocityX * time)
            //              let obj2_yFinal = obj2_currentY - (obj2_velocityY * time)
            //
            //          We need to solve for time:
            //              let diffX = obj2_xFinal-obj1_xFinal
            //              let diffY = obj2_yFinal-obj1_yFinal
            //
            //          Rearranging and subbing-in this gives:
            //              diffX = obj2_currentX - (obj2_velocityX * time) - obj1_currentX - (obj1_velocityX * time) 
            //                    = (obj2_currentX - obj1_currentX) - time*(obj2_velocityX-obj1_velocityX) 
            //                    = dx - time*dVelX
            //
            //              diffY = obj2_currentY - (obj2_velocityY * time) - obj1_currentY - (obj1_velocityY * time) 
            //                    = (obj2_currentY - obj1_currentY) - time*(obj2_velocityY-obj1_velocityY)
            //                    = dy - time*dVelY          
            //
            //          Now it is just like a collision check, as above, except this time we can solve for time:
            //              let sqr = sqr(diffX) + sqr(diffY) 
            //                      = sqr(dx - time*dVelX) + sqr(dy - time*dVelY)
            //
            //          Now to expand the brackets:
            //              sqr = sqr(dx) - 2*time*dVelX*dx + sqr(time)*sqr(dVelX) + sqr(dy) - 2*time*dVelY*dy + sqr(time)*sqr(dVelY)
            //              
            //          We're trying to find time, and or a perfect collision, sqr must equal the sum of the radii squared
            //          So our quadratic equation is:
            //              sqr = a*sqr(time) + b*time + c-radiiSqred = 0
            //              a = sqr(dVelX)+sqr(dVelY) (NOTE: dotProduct as below)
            //              b = -2*(dx*dVelX + dVelY*dy) (NOTE: dotProduct as below)
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

    function splitVelocity(object1, object2) {
        var velocity = new PVector(object1.xVel, object1.yVel);
        var a = Math.PI / 2;
    
        if (object1.xVel !== 0) {
            a = Math.atan(object1.yVel / object1.xVel);
        }

        var magnitude = object1.xVel * Math.cos(-a) - object1.yVel * Math.sin(-a) * object1.cOR;
        
        var dx = object1.x - object2.x;
        var dy = object1.y - object2.y;
    
        var ang = 0;
        if (dx !== 0) {
            ang = Math.atan(dy / dx);
        } else {
            ang = Math.atan(dy / (dx - 0.00001));
        }

        velocity.x = magnitude * (Math.cos(ang - a));
        velocity.y = magnitude * (Math.sin(ang - a));
    
        return velocity;
    }
    
    this.handleCollision = function (collision) {
        var object = collision.object;
        var object2 = collision.object2;
        
        var thisVel = splitVelocity(object, object2);
        var objVel = splitVelocity(object2, object);
    
        var newV = ((thisVel.x * (object.mass - object2.mass)) + (2 * object2.mass * objVel.x)) / (object.mass + object2.mass);
        var newV2 = ((objVel.x * (object2.mass - object.mass)) + (2 * object.mass * thisVel.x)) / (object.mass + object2.mass);
    
        var ang = Math.atan((object.y - object2.y) / (object.x - object2.x));
    
        var cosA = Math.cos(ang);
        var sinA = Math.sin(ang);
    
        var x1 = (newV * cosA) + (thisVel.y * sinA);
        var y1 = (newV * sinA) - (thisVel.y * cosA);
 
        var x2 = (newV2 * cosA) + (objVel.y * sinA);
        var y2 = (newV2 * sinA) - (objVel.y * cosA);

        this.seperateObjects(collision, object, object2);
    
        object.xVel = x1;
        object.yVel = y1;
    
        object2.xVel = x2;
        object2.yVel = y2;
    }
    
    this.seperateObjects = function(collision, object, object2) {
        var t = collision.time + (0.001 * collision.time);

        if (t < 1.0) {
            object.x -= object.xVel * settings.speedConst * t;
            object.y -= object.yVel * settings.speedConst * t;
    
            object2.x -= object2.xVel * settings.speedConst * t;
            object2.y -= object2.yVel * settings.speedConst * t;
        } else {
            var dX = object2.x - object.x;
            var dY = object2.y - object.y;
    
            var sqr = (dX * dX) + (dY * dY);
    
            var overlap = object2.radius - Math.abs(Math.sqrt(sqr) - object.radius) + 0.1;
    
            var vel1 = new PVector(object.xVel, object.yVel).getMagnitudeNS()+0.0001;
            var vel2 = new PVector(object2.xVel, object2.yVel).getMagnitudeNS()+0.0001;

            var vT = vel1 + vel2;

            var i = vel1 / vT;
    
            ang = Math.atan2(object.y - object2.y, object.x - object2.x);
    
            object.x += overlap * Math.cos(ang) * i;
            object.y += overlap * Math.sin(ang) * i;
    
            i = 1 - i;
    
            object2.x -= overlap * Math.cos(ang) * i;
            object2.y -= overlap * Math.sin(ang) * i;
        }
    }
    
    this.setBounds = function(width, height) {
        this.width = width;
        this.height = height;
    }
    
    this.update = function () {
        var objects = particles;

        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
    
            this.edgeCollision(obj, true);
            obj.update();
        }
    
        var colObjects = [];
        
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
    
            for (var i2 = i + 1; i2 < objects.length; i2++) {
                var obj2 = objects[i2];
    
                var collision = new Collision();
                if (this.collide(obj, obj2, collision)) {
                    collision.object = obj;
                    collision.object2 = obj2;
                    colObjects.push(collision);
                }
            }
        }
    
        colObjects.sort(function (a, b) {
            return a.time < b.time;
        });
    
        for (var i = 0; i < colObjects.length; i++) {
            var collision = colObjects[i];

            this.handleCollision(collision);
        }
    
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
    
            this.edgeCollision(obj, false);
        }
    }
}