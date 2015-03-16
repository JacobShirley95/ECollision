function SimEngine(width, height, particles) {
    this.width = width;
    this.height = height;
    
    this.particles = particles;
    
    this.speedConst = 1.0;
    
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
    
    function Collision() {
        this.time = 0.0;
        this.object = null;
        this.object2 = null;
    }
    
    function splitVelocity(object1, object2) {
        var velocity = new PVector(object1.xVel, object1.yVel);
        var a = Math.PI / 2;
    
        if (object1.xVel !== 0) {
            a = Math.atan(object1.yVel / object1.xVel);
        }
        velocity.rotate(-a);
    
        var magnitude = velocity.x * object1.cOR;
        
        var dx = object1.x - object2.x;
        var dy = object1.y - object2.y;
    
        var vec = new PVector(dx, dy);
        
        var ang = 0;
        if (dx !== 0) {
            ang = Math.atan(vec.y / vec.x);
        } else {
            ang = Math.atan(vec.y / (vec.x - 0.00001));
        }
    
        velocity.x = magnitude * Math.cos(ang);
        velocity.y = magnitude * Math.sin(ang);
        
        velocity.rotate(-a);
        
      /*  var dx = object1.x - object2.x;
        var dy = object1.y - object2.y;
        
        var velocity = new PVector(object1.xVel, object1.yVel);
        var a = Math.atan2(dy, dx);
        
        
        var magnitude = velocity.getMagnitude();
        
        velocity.x = magnitude * Math.cos(a);
        velocity.y = magnitude * Math.sin(a);*/
    
        return velocity;
    }
    
    this.collide = function(object, object2, collision) {
        var dX = object2.x - object.x;
        var dY = object2.y - object.y;
    
        var sqr = (dX * dX) + (dY * dY);
        var r = object2.radius + object.radius;
    
        if (sqr <= r * r) {
            var pDiff = new PVector(object.x - object2.x, object.y - object2.y);
            var vDiff = new PVector(object.xVel - object2.xVel, object.yVel - object2.yVel);
    
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
            collision.time = t2;
    
            return true;
        }
        return false;
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
            object.x -= object.xVel * this.speedConst * t;
            object.y -= object.yVel * this.speedConst * t;
    
            object2.x -= object2.xVel * this.speedConst * t;
            object2.y -= object2.yVel * this.speedConst * t;
        } else {
            var dX = object2.x - object.x;
            var dY = object2.y - object.y;
    
            var sqr = (dX * dX) + (dY * dY);
    
            var overlap = object2.radius - Math.abs(Math.sqrt(sqr) - object.radius) + 0.1;
    
            var vel1 = new PVector(object.xVel * this.speedConst, object.yVel * this.speedConst).getMagnitudeNS();
            var vel2 = new PVector(object2.xVel * this.speedConst, object2.yVel * this.speedConst).getMagnitudeNS();
    
            var i = vel1 / (vel1 + vel2);
    
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
    
    this.updateSimulation = function () {
        var objects = this.particles;

        var grav = gravity;
        var ballEnvironment = this.ballEnvironment;
        
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
    
            this.edgeCollision(obj, true);
            obj.update(this.speedConst);
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