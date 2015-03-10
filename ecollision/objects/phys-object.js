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