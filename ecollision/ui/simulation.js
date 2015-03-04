function Simulation(canvasName) {
    Widget.call(this, canvasName);

    this.paused = false;

    this.ballEnvironment = null;
    this.objects = [];
    
    var timeStamp = 0;
    var newTime = timeStamp;
    var curTime = timeStamp;
    
    var gameRate = defaultGameRate;
    var updateTime = 1000.0 / gameRate;
    
    this.views = [];

    selected = -1;
    var thisSim = this;
    
    this.stage.addEventListener("dblclick", function() {
        selected = -1;
        thisSim.getSelected().selected = false;
    });
    
    this.setSpeed = function(rate) {
        gameRate = rate;

        updateTime = 1000.0 / gameRate;
    }
    
    this.resize = function(newWidth, newHeight) {
        this.ballEnvironment.setBounds(newWidth, newHeight);
    }
    
    this.getGameRate = function() {
        return gameRate;
    }
    
    this.getUpdateTime = function() {
        return updateTime;
    }
    
    this.addBall = function(x, y, mass, radius, style) {
        var ball = new Ball(x, y, radius, style);
        
        ball.mass = mass;
        
        var objects = this.objects;
        ball.addEventHandler("click", function (ev) {
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
                
        this.stage.addChild(ball.displayObj);
        this.objects.push(ball);
        
        return ball;
    }
    
    this.removeBall = function(index) {
        this.stage.removeChild(this.objects[index].displayObj);
        this.objects.splice(index, 1);
    }

    this.loadBalls = function(objects) {
        this.init();

        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            var ball = this.addBall(obj.x, obj.y, obj.mass, obj.radius, obj.style);

            ball.xVel = obj.xVel;
            ball.yVel = obj.yVel;
            ball.cOR = obj.cOR;
        }
    }
    
    this.removeSelected = function() {
        if (selected != -1) {
            this.removeBall(selected);
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
        this.ballEnvironment = new BallEnvironment(this.width, this.height, this.objects);
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
                    this.updateSimulation();
                    
                    newTime += updateTime;
                }
            }
        }
        
        var interpolation = Math.min(1.0, (curTime - timeStamp) / updateTime);

        if (selected != -1) {
            log(interpolation);
        }

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

    this.update = function() {
        
    }
    
    var timeStamp = 0;
    var newTime = timeStamp;
    var curTime = timeStamp;
    
    var gameRate = defaultGameRate;
    var updateTime = 1000.0 / gameRate;
    
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

Simulation.prototype = new Widget();