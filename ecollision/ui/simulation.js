function Simulation(canvasName) {
    Widget.call(this, canvasName);

    this.paused = false;

    this.ballEnvironment = new BallEnvironment(width, height);
    this.objects = [];
    
    this.timeStamp = new Date().getTime();
    this.newTime = timeStamp;
    this.fpsTime = timeStamp;
    
    this.gameRate = defaultGameRate;
    this.updateTime = 1000.0 / this.gameRate;
    
    this.views = [];
    
    var selected = -1;
    
    this.setSpeed = function(rate) {
        this.gameRate = rate;

        this.updateTime = 1000.0 / this.gameRate;
    }
    
    this.resize = function(newWidth, newHeight) {
        this.ballEnvironment.setBounds(newWidth, newHeight);
    }
    
    this.addBall = function(x, y, mass, radius, style) {
        var ball = new Ball(x, y, radius, style, false);
        
        ball.mass = mass;
        
        var objects = this.objects;
        ball.addEventHandler("click", function (ev) {
            if (selected != -1)
                objects[selected].selected = false;
                
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
                
        this.stage.addChild(ball.displayObj);
        this.ballEnvironment.addBall(ball);
        this.objects.push(ball);
        
        return ball;
    }
    
    this.removeBall = function(index) {
        this.stage.removeChild(this.objects[index].displayObj);
        this.ballEnvironment.removeBall(index);
        this.objects.splice(index, 1);
    }
    
    this.removeSelected = function() {
        if (selected != -1) {
            this.removeBall(selected);
            selected = -1;
        }
    }
    
    this.init = function() {
        this.stage.removeAllChildren();
        
        this.objects = [];
    
        var xShift = 20;
        var yShift = 20;
    
        var colours = ["black", "yellow", "blue", "red", "purple"];
        var coloursLen = colours.length;
        
        /*for (i = 0; i < yRows; i++) {
            for (j = 0; j < yRows - i; j++) {
                this.addBall(xShift + (j * 21) + (i * 10), yShift + (i * 18), 155, 10, getRandomColor());
            }
        }*/
        
        var b1 = this.addBall(100, 100, 155, 10, "blue");
        b1.xVel = 1000;
        /*var b2 = this.addBall(300, 300, 155, 10, "green");
        
        var v1 = 2;
        var v2 = -2;
        
        b1.xVel = v1;
        b1.yVel = v1;
        
        b2.xVel = v2;
        b2.yVel = v2;*/
        
    }
    
    this.addView = function (view) {
        this.views.push(view);
        view.init();
    }
    
    this.removeView = function(view) {
        view.destroy();
    }
    
    this.restart = function () {
        this.init();
    }
    
    this.draw = function () {
        var curTime = new Date().getTime();
        var objects = this.objects;
    
        if (!this.paused) {
            if (this.newTime + this.updateTime < curTime) {
                this.timeStamp = curTime;
                if (enableInterpolation) {
                    for (var i = 0; i < objects.length; i++) {
                        objects[i].capture();
                    }
                }
                while (this.newTime + this.updateTime < curTime) {
                    this.updateSimulation();
                    
                    this.newTime += this.updateTime;
                }
            }
        } else {
            this.newTime = curTime;
        }
        
        var interpolation = Math.min(1.0, (curTime - this.timeStamp) / this.updateTime);

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
        
        this.stage.scaleX = this.renderData.zoom;
        this.stage.scaleY = this.renderData.zoom;
        this.stage.update();
    }
    
    this.updateSimulation = function () {
        var objects = this.objects;
        var grav = gravity;
        var ballEnvironment = this.ballEnvironment;
        
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
    
            ballEnvironment.edgeCollision(obj, true);
            obj.update();
        }
    
        var colObjects = [];
        
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
    
            for (var i2 = i + 1; i2 < objects.length; i2++) {
                var obj2 = objects[i2];
    
                var collision = new Collision();
                if (ballEnvironment.collide(obj, obj2, collision)) {
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
            ballEnvironment.handleCollision(collision);
        }
    
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
    
            ballEnvironment.edgeCollision(obj, false);
        }
        
        $.each(this.views, function(i, view) {
           view.update(); 
        });
    }
    
    this.updateSimulationRev = function () {
        var objects = this.objects;
        var grav = gravity;
        var ballEnvironment = this.ballEnvironment;
        
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
    
            ballEnvironment.edgeCollision(obj, true);
            obj.updateReverse();
        }
    
        var colObjects = [];
        
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
    
            for (var i2 = i + 1; i2 < objects.length; i2++) {
                var obj2 = objects[i2];
    
                var collision = new Collision();
                if (ballEnvironment.collide(obj, obj2, collision)) {
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
            ballEnvironment.handleCollision(collision);
        }
    
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
    
            ballEnvironment.edgeCollision(obj, false);
        }
    }
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

Simulation.prototype = new Widget();