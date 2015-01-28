$("#add-ball").click(function() {
    var velocity = $("#slider-velocity").sliderEx("value");
    var mass = $("#slider-mass").sliderEx("value");
        
    var friction = $("#slider-friction").sliderEx("value");
    var radius = $("#slider-radius").sliderEx("value");

    var x = radius+(Math.random()*(sim.width-radius));
    var y = radius+(Math.random()*(sim.height-radius));
    
    var ball = sim.addBall(x, y, mass, radius, getRandomColor());
    var ang = Math.random()*2*Math.PI;
    
    ball.xVel = velocity*Math.cos(ang);
    ball.yVel = velocity*Math.sin(ang);
});

$("#remove-ball").click(function() {
    sim.removeSelected();
});

$("#calibrate").click(function() {
    graph.calibrate();
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


$(".ball-slider").sliderEx();

$("#trace").click(function() {
    enableTrace = !enableTrace;   
});
$("#gravity").click(function() {
    enableGravity = !enableGravity;   
});
$("#col-data").click(function() {
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
    if (sim.paused)
        sim.updateSimulation();
});

$("#zoom-slider").sliderEx({
    value:100,
    slide: function(event, ui) {
        sim.renderData.zoom = ui.value/100;
    }
});

$("#sim-speed-slider").sliderEx({
    value:250,
    slide: function(event, ui) {
        sim.setSpeed(ui.value);
    }
});

$('#graph-canvas').attr("width",$('#graph-canvas').width());
$('#graph-canvas').attr("height",$('#graph-canvas').height());

$('#widget-canvas').attr("width",$('#widget-simulation').width());
$('#widget-canvas').attr("height",$('#widget-simulation').height());
  
start();