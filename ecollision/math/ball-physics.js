function PhysObject(x, y, mass) {
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
        this.x += this.xVel;
        this.y += this.yVel;
    };
    
    this.updateReverse = function () {
        this.x -= this.xVel;
        this.y -= this.yVel;
    };

    this.addEventHandler = function (event, handler) {
        this.displayObj.addEventListener(event, handler);
    }
    
    this.draw = function (x, y) {
        this.displayObj.x = x;
        this.displayObj.y = y;
    }
}

function Collision() {
    this.time = 0.0;
    this.object;
}

function Cue() {
    this.angle = 0.0;
    this.show = false;
}

function Ball(x, y, radius, style, allowedCue) {
    PhysObject.call(this, x, y, 10);

    this.radius = radius;
    this.bounce = 1;
    this.style = style;
    this.cue = new Cue();

    this.edgeOverlapX = 0.0;
    this.edgeOverlapY = 0.0;

    this.mouseX = 0.0;
    this.mouseY = 0.0;
    this.allowedCue = allowedCue;
    this.clicked = false;

    this.pastPositions = [];
    this.curID = 0;
    
    this.selected = false;
    
    this.draw = function (x, y) {
        this.displayObj.x = x;
        this.displayObj.y = y;
        
        this.displayObj.graphics.clear();
        
        var len = this.pastPositions.length;
        
        if (this.selected) {
            this.displayObj.graphics.beginStroke("red").drawCircle(0, 0, 10).endStroke();
        }
        
        if (!sim.paused && enableTrace) {
            this.curID++;
            this.curID %= maxTracePositions;
            if (len < maxTracePositions) {
                this.pastPositions.push(new Point2D(x, y));
            } else {
                this.pastPositions[this.curID] = new Point2D(x, y);
            }
            
            var rr = Math.round(Math.random()*256);
            var rg = Math.round(Math.random()*256);
            var rb = Math.round(Math.random()*256);

            for (var i = 1; i < len; i++) {
                var p = this.pastPositions[(i + this.curID) % len];
                var px = p.x-x;
                var py = p.y-y;

                var r_a = i / len;

                var col = "rgba("+rr+", "+rg+", "+rb+", "+r_a+")";
                this.displayObj.graphics.beginStroke(col).drawCircle(px, py, 10);
            }
        }
        
        this.displayObj.graphics.beginFill(this.style).drawCircle(0, 0, 10).endFill();
        
        
        var scaleFactor = 3;
        this.displayObj.graphics.beginStroke("red").setStrokeStyle(3).moveTo(0, 0).lineTo(this.xVel*scaleFactor, this.yVel*scaleFactor).endStroke();
    };
    
    this.update = function () {
        if (!this.clicked) {
            if (enableGravity) this.yVel += gravity;

            if (enableFriction) {
                this.xVel *= 0.995;
                this.yVel *= 0.995;
            }

            this.x += this.xVel;
            this.y += this.yVel;
            
            //if (this.y + this.yVel + this.radius < window.innerHeight)
               // this.y += this.yVel;
        }
    };
    
    this.updateReverse = function() {
        if (!this.clicked) {
            if (enableGravity) 
                this.yVel -= gravity;

            if (enableFriction) {
                this.xVel *= 0.995;
                this.yVel *= 0.995;
            }

            this.x -= this.xVel;
            this.y -= this.yVel;
        }
    };
}


//Splits the velocities of 
function splitVelocity(object1, object2) {
    var cOR = 0.98;
        
    var velocity = new PVector(object1.xVel, object1.yVel);
    var a = Math.PI / 2;

    if (object1.xVel !== 0) {
        a = Math.atan(object1.yVel / object1.xVel);
    }
    velocity.rotate(-a);

    var v = velocity.x * cOR;

    var dx = object1.x - object2.x;
    var dy = object1.y - object2.y;

    var vec = new PVector(dx, dy);
    var ang = 0;
    if (dx !== 0) {
        ang = Math.atan(vec.y / vec.x);
    } else {
        ang = Math.atan(vec.y / (vec.x - 0.00001));
    }

    velocity.x = v * Math.cos(ang);
    velocity.y = v * Math.sin(ang);
    velocity.rotate(-a);

    return velocity;
}

function BallEnvironment(width, height) {
    this.width = width;
    this.height = height;
    
    this.balls = [];
    
    this.edgeCollision = function (ball, rebound) {
        var cOR = 0.8;
        
        ball.edgeOverlapX = 0.0;
        ball.edgeOverlapY = 0.0;
        
        if (ball.x + ball.radius >= this.width) {
            ball.edgeOverlapX = ball.x + ball.radius - this.width;
    
            if (rebound) {
                ball.xVel *= -cOR;
                ball.yVel *= cOR;
            } else {
                ball.x = this.width - ball.radius;
            }
        } else if (ball.x - ball.radius <= 0) {
            ball.edgeOverlapY = 0 - ball.x - ball.radius;
            if (rebound) {
                ball.xVel *= -cOR;
                ball.yVel *= cOR;
            } else {
                ball.x = ball.radius;
            }
        }
    
        if (ball.y + ball.radius >= this.height) {
            ball.edgeOverlapY = ball.y + ball.radius - this.height;
            if (rebound) {
                ball.xVel *= cOR;
                ball.yVel *= -cOR;
            } else {
                ball.y = this.height - ball.radius;
            }
        } else if (ball.y - ball.radius <= 0) {
            ball.edgeOverlapY = 0 - ball.y - ball.radius;
            if (rebound) {
                ball.xVel *= cOR;
                ball.yVel *= -cOR;
            } else {
                ball.y = ball.radius;
            }
        } 
    } 
    
    this.addBall = function(ball) {
        this.balls.push(ball);
    }
    
    this.removeBall = function(index) {
        this.balls.splice(index, 1);
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
        } else return false;
    }
    
    this.handleCollision = function (collision) {
        var object = collision.object;
        var object2 = collision.object2;
    
        var thisVel = splitVelocity(object, object2);
        var objVel = splitVelocity(object2, object);
    
        var newV = ((thisVel.x * (object.mass - object2.mass)) + (2 * object2.mass * objVel.x)) / (object.mass + object2.mass);
        var newV2 = ((objVel.x * (object2.mass - object.mass)) + (2 * object.mass * thisVel.x)) / (object.mass + object2.mass);
    
        var ang = Math.atan((object.y - object2.y) / (object.x - object2.x));
    
        var velocity1 = new PVector(newV * Math.cos(ang), newV * Math.sin(ang));
        var velocity2 = new PVector(thisVel.y * Math.sin(ang), thisVel.y * Math.cos(ang));
    
        ang = Math.atan((object2.y - object.y) / (object2.x - object.x));
    
        var velocity3 = new PVector(newV2 * Math.cos(ang), newV2 * Math.sin(ang));
        var velocity4 = new PVector(objVel.y * Math.sin(ang), objVel.y * Math.cos(ang));
    
        var vF = new PVector(velocity1.x + velocity2.x, velocity1.y - velocity2.y);
        var vF2 = new PVector(velocity3.x + velocity4.x, velocity3.y - velocity4.y);
    
        var t = collision.time + (0.001 * collision.time);
    
        if (t < 1.0) {
            object.x -= object.xVel * t;
            object.y -= object.yVel * t;
    
            object2.x -= object2.xVel * t;
            object2.y -= object2.yVel * t;
        } else {
            var dX = object2.x - object.x;
            var dY = object2.y - object.y;
    
            var sqr = (dX * dX) + (dY * dY);
    
            var overlap = object2.radius - Math.abs(Math.sqrt(sqr) - object.radius) + 0.1;
    
            var vel1 = new PVector(object.xVel, object.yVel).getMagnitudeNS();
            var vel2 = new PVector(object2.xVel, object2.yVel).getMagnitudeNS();
    
            var i = vel1 / (vel1 + vel2);
    
            ang = Math.atan2(object.y - object2.y, object.x - object2.x);
    
            object.x += overlap * Math.cos(ang) * i;
            object.y += overlap * Math.sin(ang) * i;
    
            i = 1 - i;
    
            object2.x -= overlap * Math.cos(ang) * i;
            object2.y -= overlap * Math.sin(ang) * i;
        }
    
        object.xVel = vF.x;
        object.yVel = vF.y;
    
        object2.xVel = vF2.x;
        object2.yVel = vF2.y;
    }
    
    this.setBounds = function(width, height) {
        this.width = width;
        this.height = height;
    }
}

Ball.prototype = new PhysObject();