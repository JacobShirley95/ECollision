function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

var canvas = $("#ecol-canvas");

var w = canvas.width();
var h = canvas.height();

var settings = new ECollisionSettings();
settings.simulation.simulationCanvas = "ecol-canvas";
settings.global.maxParticles = 1000;

var ecollision = new ECollision(settings);

for (var i = 0; i < 0; i++) {
  var p = ecollision.simulationUI.addParticle(Math.random()*w, Math.random()*h, 50, 10, getRandomColor());

  p.xVel = 3;
  p.yVel = 3;
}

function setCol(text, col) {
    return ("" + text).fontcolor(col);
}

ecollision.onTick = function() {
  var fps = "";
  if (ecollision.fps < 24) {
    fps = setCol(ecollision.fps, "red");
  } else {
    fps = setCol(ecollision.fps, "green");
  }
  var debugStr = "FPS: " + fps + " Hz "+
  							 "<br/> Number of particles: " + setCol(ecollision.engine.numOfParticles(), "green");

  $("#fps-counter").html(debugStr);
}

ecollision.simulationUI.onSelect = function(particle) {
    $("#x-slider").slider("value", particle.x);
    $("#y-slider").slider("value", particle.y);
    $("#x-vel-slider").slider("value", particle.xVel);
    $("#y-vel-slider").slider("value", particle.yVel);
    $("#radius-slider").slider("value", particle.radius);
    $("#mass-slider").slider("value", particle.mass);
    $("#cor-slider").slider("value", particle.cOR);
}

ecollision.start();

$("#run-pause").click(function() {
    if (ecollision.paused)
        ecollision.resume();
    else
        ecollision.pause();

    changeRunPauseBtn();
});

$("#step").click(function() {
	if (ecollision.paused)
    ecollision.update();
});

function changeRunPauseBtn() {
    if (!ecollision.paused) {
        $("#run-pause").find(".ui-button-text").text("Pause");
    } else {
        $("#run-pause").find(".ui-button-text").text("Run");
    }
}

$("#add").click(function() {
	var x = $("#x-slider").slider("value");
	var y = $("#y-slider").slider("value");
  var xVel = $("#x-vel-slider").slider("value");
  var yVel = $("#y-vel-slider").slider("value");
  var radius = $("#radius-slider").slider("value");
  var mass = $("#mass-slider").slider("value");
  var cor = $("#cor-slider").slider("value");
  
	var p = ecollision.simulationUI.addParticle(x, y, mass, radius, getRandomColor());
  
  p.cOR = cor;
  p.xVel = xVel;
  p.yVel = yVel;
});

$("#remove").click(function() {
	ecollision.simulationUI.removeSelected();
});

$("#clear").click(function() {
	ecollision.restart();
});

$(".button").button();

$("#x-slider").slider({
		value:w/2,
		min:0,
    max:w,
		slide: function( event, ui ) {
        $("#x-val").text(ui.value);
    }
});

$("#x-val").text($("#x-slider").slider("value"));

$("#y-slider").slider({
		value:h/2,
		min:0,
    max:h,
		slide: function( event, ui ) {
        $("#y-val").text(ui.value);
    }
});

$("#y-val").text($("#y-slider").slider("value"));

$("#x-vel-slider").slider({
		value:0,
		min:-10,
    max:10,
		slide: function( event, ui ) {
        $("#x-vel-val").text(ui.value);
    }
});

$("#x-vel-val").text($("#x-vel-slider").slider("value"));

$("#y-vel-slider").slider({
		value:0,
		min:-10,
    max:10,
		slide: function( event, ui ) {
        $("#y-vel-val").text(ui.value);
    }
});

$("#y-vel-val").text($("#y-vel-slider").slider("value"));

$("#radius-slider").slider({
		value:30,
		min:0,
    max:60,
		slide: function( event, ui ) {
        $("#radius-val").text(ui.value);
    }
});

$("#radius-val").text($("#radius-slider").slider("value"));

$("#mass-slider").slider({	
		value:500,
		min:0,
    max:1000,
		slide: function( event, ui ) {
        $("#mass-val").text(ui.value);
    }
});

$("#mass-val").text($("#mass-slider").slider("value"));

$("#cor-slider").slider({
		value:1,
		step:0.01,
		min:0,
    max:1,
		slide: function( event, ui ) {
        $("#cor-val").text(ui.value);
    }
});

$("#cor-val").text($("#cor-slider").slider("value"));

$("#sim-speed-slider").slider({
		step:0.01,
    value: 1,
		min:0,
    max:2,
		slide: function( event, ui ) {
        settings.global.speedConst = ui.value;
        $("#sim-speed-val").text(ui.value);
    }
});

$("#sim-speed-val").text($("#sim-speed-slider").slider("value"));