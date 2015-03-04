$.widget("custom.sliderEx", $.ui.slider, {
    _unit:"",
    _amount: null,
    _formatVal: function(val) {
        if (val > 0.09 && val < 1) {
            val = val.toPrecision(2);
        }
        return val+" "+this._unit;
    },
    _slide: function () {
        this._superApply(arguments);

        this._amount.text(this._formatVal(this.options.value));

        var pos = this.handle.position();
        var width = this._amount.width()/2;
        
        var newLeft = pos.left;
        
        this._amount.css("left", newLeft+"px");
    },
    
    _start: function() {
        this._superApply(arguments);
        var left = this.handle.css("left");
        
        this._amount.css('visibility','visible').hide().fadeIn("fast").css("left", left);
    },
    
    _stop: function() {
        this._superApply(arguments);

        this._amount.fadeOut("fast");
    },
    
    _create: function() {
        var min = parseFloat(this.element.attr("min"));
        var max = parseFloat(this.element.attr("max"));
        
        this.options.min = min;
        this.options.max = max;
        
        if (this.element.attr("step") != undefined) {
            var step = parseFloat(this.element.attr("step"));
            
            this.options.step = step;
        }
        
        var value = this.element.attr("value");
        if (value == undefined) {
            this.options.value = min+max/2;
        } else {
            this.options.value = parseFloat(value);
        }
        
        var unit = this.element.attr("unit");
        if (unit != undefined) {
            this._unit = unit;
        }
        
        this._amount = $('<div class="slider-amount">'+this._formatVal(this.options.value)+'</div>');
        
        this.element.append(this._amount).mousedown(function(event) {
            event.stopPropagation();
        });
        
        this._super();
    }
});

$(".ball-slider").sliderEx();

$("#add-ball").click(function() {
    var velocity = $("#slider-velocity").sliderEx("value");
    var mass = $("#slider-mass").sliderEx("value");
        
    var cOR = $("#slider-cor").sliderEx("value");
    var radius = $("#slider-radius").sliderEx("value");

    var x = radius+(Math.random()*(sim.width-radius));
    var y = radius+(Math.random()*(sim.height-radius));
    
    var ball = sim.addBall(x, y, mass, radius, getRandomColor());
    var ang = Math.random()*2*Math.PI;

    ball.xVel = velocity*Math.cos(ang);
    ball.yVel = velocity*Math.sin(ang);
    ball.cOR = cOR;
});

$("#remove-ball").click(function() {
    sim.removeSelected();
});

$("#calibrate").click(function() {
    graph.userCalibrate();
});

$("#zoom-in").click(function() {
    graph.zoomIn();
});

$("#zoom-out").click(function() {
    graph.zoomOut();
});

$("#move-up").click(function() {
    graph.moveUp();
});

$("#move-down").click(function() {
    graph.moveDown();
});

$("#trace").click(function() {
    enableTrace = !enableTrace;   
});

$("#gravity").click(function() {
    enableGravity = !enableGravity;   
});

$("#sim-data").click(function() {
    enableColData = !enableColData;  
});

$("#btn-run").click(function() {
    sim.paused = false;
});

$("#btn-stop").click(function() {
    sim.paused = true;
});

$("#btn-back").click(function() {
    sim.updateSimulationRev();
});

$("#btn-next").click(function() {
    if (sim.paused) {
        sim.paused = false;
        tick();
        sim.paused = true;
    }
});

var savedState = [];

$("#btn-save").click(function() {
    savedState = [];
    for (var i = 0; i < sim.objects.length; i++) {
        var obj = sim.objects[i];
        var ball = new Ball(obj.x, obj.y, obj.radius, obj.style);

        ball.mass = obj.mass;
        ball.xVel = obj.xVel;
        ball.yVel = obj.yVel;
        
        ball.cOR = obj.cOR;

        savedState.push(ball);
    }
});

$("#btn-load").click(function() {
    sim.loadBalls(savedState);
});

$("#btn-reset").click(function() {
    sim.restart();
});

$("#zoom-slider").sliderEx({
    slide: function(event, ui) {
        sim.renderData.zoom = ui.value/100;
    }
});

$("#sim-speed-slider").sliderEx({
    slide: function(event, ui) {
        sim.setSpeed(ui.value);
    },
    stop: function(event, ui) {
        graph.updateData();
    }
});

$('#graph-canvas').attr("width",$('#graph-canvas').width());
$('#graph-canvas').attr("height",$('#graph-canvas').height());

$('#widget-canvas').attr("width",$('#widget-canvas').width());
$('#widget-canvas').attr("height",$('#widget-canvas').height());

start();