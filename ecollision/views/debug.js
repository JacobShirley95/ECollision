function DebugView(stage, balls) {
    View.call(this, stage);
    
    this.balls = balls;
    
    var ball = null;
    
    this.init = function() {
        ball = new createjs.Shape();
        
        ball.x = 100;
        ball.y = 100;
        
        ball.graphics.beginFill("red").drawCircle(0, 0, 10).endFill();
        
        this.stage.addChild(ball);
    }
    
    this.destroy = function() {
        this.stage.removeChild(ball);
    }
    
    this.update = function () {
        $.each(this.balls, function(i, obj) {
            ball.x += 1;
            console.log("hello");
        });
        this.stage.update();
    }
}

DebugView.prototype = new View();