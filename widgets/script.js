$("#add-ball").click(function() {
    var velocity = $("#slider-velocity").sliderEx("value");
    var mass = $("#slider-mass").sliderEx("value");
        
    var friction = $("#slider-friction").sliderEx("value");
    var radius = $("#slider-radius").sliderEx("value");

    var x = radius+(Math.random()*(width-radius));
    var y = radius+(Math.random()*(height-radius));
    
    var ball = sim.addBall(x, y, mass, radius, getRandomColor());
    var ang = Math.random()*2*Math.PI;
    
    ball.xVel = velocity*Math.cos(ang);
    ball.yVel = velocity*Math.sin(ang);
});

$("#remove-ball").click(function() {
    sim.removeSelected();
});

$("#zoom-in").click(function() {
    graph.zoomIn();
});

$("#zoom-out").click(function() {
    graph.zoomOut();
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

        
var refreshRate = 80;
var defaultGameRate = 50;

var enableDebug = false;
var enableTrace = false;

var enableGravity = false;
var enableFriction = false;
var enableDragAndDrop = false;

var enableColData = false;

var yRows = 5; // min 1, max 10

var width = 500;
var height = 500;

var speedState = -1;
var slowMotionConst = 1.0;

function RenderData() {
    this.zoom = 1.0;

    this.offsetX = 0.0;
    this.offsetY = 0.0;
}

var renderData = new RenderData();

$('#graph-canvas').attr("width",$('#widget-graph').width());
$('#graph-canvas').attr("height",$('#widget-graph').height());

$('#widget-canvas').attr("width",$('#widget-simulation').width());
$('#widget-canvas').attr("height",$('#widget-simulation').height());
  
width = $('#widget-simulation').width();
height = $('#widget-simulation').height();
  
console.log("ASFSDF");
start();