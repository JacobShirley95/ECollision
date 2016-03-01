var ECollisionSettings = require('../../../bin/out/settings');
var ECollision = require('../../../bin/out/ecollision');

$.widget("custom.sliderEx", $.ui.slider, {
  _create: function() {
    this.options.title = this.options.title || this.element.attr("title");
    
    this.options._valueDiv = $("<div class='slider-val'></div>");
    
    var title = this.options.title;
    var parent = $("<div class='slider-comp'></div>");
  
    parent.insertBefore(this.element);
    parent.append("<div class='slider-title'>"+title+"</div>");
    
    this.element.addClass("slider");

    parent.append(this.element.detach());
    parent.append(this.options._valueDiv);
    
    this.options._valueDiv.text(this.options.value);
    
    return this._super();
  },
  _slide: function() {
    this._superApply(arguments);
    
    this.options._valueDiv.text(this.options.value);
  }
});

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

ecollision.addListener("tick", function(interpolation) {
  var fps = "";
  if (ecollision.fps < 24) {
    fps = setCol(ecollision.fps, "red");
  } else {
    fps = setCol(ecollision.fps, "green");
  }

  $("#fps-counter").html("FPS: " + fps + " Hz");
  $("#num-particles").html("Number of particles: " + setCol(ecollision.engine.particles.length, "green"));
});

ecollision.simulationUI.onSelect = function(particle) {
    $("#x-slider").sliderEx("value", particle.x);
    $("#y-slider").sliderEx("value", particle.y);
    $("#x-vel-slider").sliderEx("value", particle.xVel);
    $("#y-vel-slider").sliderEx("value", particle.yVel);
    $("#radius-slider").sliderEx("value", particle.radius);
    $("#mass-slider").sliderEx("value", particle.mass);
    $("#cor-slider").sliderEx("value", particle.cOR);
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
  var x = $("#x-slider").sliderEx("value");
  var y = $("#y-slider").sliderEx("value");
  var xVel = $("#x-vel-slider").sliderEx("value");
  var yVel = $("#y-vel-slider").sliderEx("value");
  var radius = $("#radius-slider").sliderEx("value");
  var mass = $("#mass-slider").sliderEx("value");
  var cor = $("#cor-slider").sliderEx("value");
  
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

$("#sim-speed-slider").sliderEx({
    step:0.01,
    value: 1,
    min:0,
    max:2,
    slide: function (event, ui) {
      settings.global.speedConst = ui.value;
    }
});

$("#x-slider").sliderEx({
    value:w/2,
    min:0,
    max:w
});

$("#y-slider").sliderEx({
    value:h/2,
    min:0,
    max:h
});

$("#x-vel-slider").sliderEx({
    value:0,
    min:-30,
    max:30
});

$("#y-vel-slider").sliderEx({
    value:0,
    min:-30,
    max:30
});

$("#radius-slider").sliderEx({
    value:30,
    min:0,
    max:60
});

$("#mass-slider").sliderEx({  
    value:500,
    min:0,
    max:1000
});

$("#cor-slider").sliderEx({
    value:1,
    step:0.01,
    min:0,
    max:1
});