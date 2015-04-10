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

        if (this.selected || settings.showVelocities) {
            graphics.beginStroke("red").setStrokeStyle(3).moveTo(0, 0).lineTo(this.xVel*settings.updateRate, this.yVel*settings.updateRate).endStroke();
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
        this.x += this.xVel*settings.speedConst;
        this.y += this.yVel*settings.speedConst;

        var len = pastPositions.length;
        if (this.selected) {
            curPos++;
            curPos %= settings.maxTraceLength;
            if (len < settings.maxTraceLength) {
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