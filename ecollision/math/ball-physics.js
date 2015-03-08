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

    this.update = function (speedConst) {
        this.x += this.xVel*speedConst;
        this.y += this.yVel*speedConst;
    };

    this.addEventHandler = function (event, handler) {
        this.displayObj.addEventListener(event, handler);
    }
    
    this.getEnergy = function() {
        return 0.5 * this.mass * (this.xVel*this.xVel) + (this.yVel*this.yVel);
    }
    
    this.draw = function (x, y) {
        this.displayObj.x = x;
        this.displayObj.y = y;
    }
}

function Ball(x, y, radius, style) {
    PhysObject.call(this, x, y, 10);

    this.radius = radius;
    
    this.style = style;

    this.mouseX = 0.0;
    this.mouseY = 0.0;

    var pastPositions = [];

    var curID = 0;
    
    this.cOR = 0.99;
    
    this.selected = false;
    
    this.draw = function (x, y) {
        this.displayObj.x = x;
        this.displayObj.y = y;
        
        this.displayObj.graphics.clear();
        
        var len = pastPositions.length;
        
        if (enableColData) {
            var scaleFactor = 10;
            this.displayObj.graphics.beginStroke("red").setStrokeStyle(3).moveTo(0, 0).lineTo(this.xVel*scaleFactor, this.yVel*scaleFactor).endStroke();
        }

        if (this.selected) {
            var rr = 50;//Math.round(Math.random()*256);
            var rg = 50;//Math.round(Math.random()*256);
            var rb = 50;//Math.round(Math.random()*256);

            for (var i = 1; i < len; i++) {
                var p = pastPositions[(i + curID) % len];
                var px = p.x-x;
                var py = p.y-y;

                var r_a = i / len;

                var col = "rgba("+rr+", "+rg+", "+rb+", "+r_a+")";
                this.displayObj.graphics.beginStroke(col).drawCircle(px, py, this.radius).endStroke();
            }

            this.displayObj.graphics.beginStroke("red").setStrokeStyle(3).drawCircle(0, 0, this.radius).endStroke();
        }

        this.displayObj.graphics.beginFill(this.style).drawCircle(0, 0, this.radius).endFill();
    };
    
    this.deselect = function() {
        this.selected = false;
        pastPositions = [];
    }
    
    this.update = function (speedConst) {
        if (enableGravity) this.yVel += gravity;

        if (enableFriction) {
            this.xVel *= 0.995;
            this.yVel *= 0.995;
        }

        this.x += this.xVel*speedConst;
        this.y += this.yVel*speedConst;

        var len = pastPositions.length;
        if (this.selected) {
            curID++;
            curID %= maxTracePositions;
            if (len < maxTracePositions) {
                pastPositions.push(new Point2D(this.x, this.y));
            } else {
                pastPositions[curID] = new Point2D(this.x, this.y);
            }
        }
    };
}

Ball.prototype = new PhysObject();