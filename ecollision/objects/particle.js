function Particle(x, y, radius, style) {
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
        
        var graphics = this.displayObj.graphics;
        
        graphics.clear();

        if (enableColData) {
            var scaleFactor = 10;
            graphics.beginStroke("red").setStrokeStyle(3).moveTo(0, 0).lineTo(this.xVel*scaleFactor, this.yVel*scaleFactor).endStroke();
        }

        if (this.selected) {
            var rr = 50;//Math.round(Math.random()*256);
            var rg = 50;//Math.round(Math.random()*256);
            var rb = 50;//Math.round(Math.random()*256);

            var len = pastPositions.length;
            for (var i = 1; i < len; i++) {
                var p = pastPositions[(i + curID) % len];
                var px = p.x-x;
                var py = p.y-y;

                var r_a = i / len;

                var col = "rgba("+rr+", "+rg+", "+rb+", "+r_a+")";
                graphics.beginStroke(col).drawCircle(px, py, this.radius).endStroke();
            }

            graphics.beginStroke("red").setStrokeStyle(3).drawCircle(0, 0, this.radius).endStroke();
        }

        graphics.beginFill(this.style).drawCircle(0, 0, this.radius).endFill();
    };

    this.select = function() {
        this.selected = true;
    }
    
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

Particle.prototype = new PhysObject();