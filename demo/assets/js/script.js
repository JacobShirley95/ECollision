var eCollisionSettings = new ECollisionSettings();
var ecollision = new ECollision(eCollisionSettings);

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

        this.options.step = parseFloat(this.element.attr("step")) || 1.0;
        
        this.options.value = parseFloat(this.element.attr("value")) || (min+max/2);
        
        var unit = this.element.attr("unit");
        this._unit = unit || "";
        
        this._amount = $('<div class="slider-amount">'+this._formatVal(this.options.value)+'</div>');
        
        this.element.append(this._amount).mousedown(function(event) {
            event.stopPropagation();
        });
        
        this._super();
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

function toDegrees(ang) {
    var a = ((ang / Math.PI) * 180)+90;
    if (a < 0)
        a += 360;
    else if (a > 360) {
        a -= 360;
    }
    return a;
}

function setCol(text, col) {
    return ("" + text).fontcolor(col);
}

function setColGreen(text) {
    return setCol(text, "green");
}

function dbgBool(bool) {
    if (bool)
        return setCol(""+bool, "green");
    else
        return setCol(""+bool, "red");
}

function log(s) {
    console.log(s);
}

$("#slider-mass").sliderEx({
    slide: function(event, ui) {
        var cp = ecollision.overlayUI.getCurrentParticle() || ecollision.simulationUI.getSelected();
        if (cp != null)
            cp.mass = ui.value;
    }
});
    
$("#slider-cor").sliderEx({
    slide: function(event, ui) {
        var cp = ecollision.overlayUI.getCurrentParticle() || ecollision.simulationUI.getSelected();
        if (cp != null)
            cp.cOR = ui.value;
    }
});

function openAdd() {
    var mode = ecollision.overlayUI.getMode();
    if (mode == 0) {
        ecollision.overlayUI.end();
    } else {
        var mass = $("#slider-mass").sliderEx("value");
        var cOR = $("#slider-cor").sliderEx("value");

        ecollision.overlayUI.beginAdd(mass, cOR, currentColor);
    }
}

function openEdit() {
    var mode = ecollision.overlayUI.getMode();
    if (mode == 1) {
        ecollision.overlayUI.end();
    } else {
        ecollision.overlayUI.beginEdit();
    }
}

$(document).keypress(function(ev) {
    if (ev.charCode == 97) {
        openAdd();
    } else if (ev.charCode == 101) {
        openEdit();
    }
});

$("#add-particle").click(function() {
    openAdd();
});

$("#remove-particle").click(function() {
    openEdit();
});

var currentColor = getRandomColor();

$("#generate-colour").click(function() {
    var cp = ecollision.overlayUI.getCurrentParticle() || ecollision.simulationUI.getSelected();
    if (cp != null) {
        currentColor = getRandomColor();
        cp.style = currentColor;
    }
})

$("#calibrate").click(function() {
    ecollision.graphUI.calibrate();
});

$("#zoom-in").click(function() {
    ecollision.graphUI.zoomIn();
});

$("#zoom-out").click(function() {
    ecollision.graphUI.zoomOut();
});

$("#move-up").click(function() {
    ecollision.graphUI.moveUp();
});

$("#move-down").click(function() {
    ecollision.graphUI.moveDown();
});

$("#btn-sim-data").click(function() {
    eCollisionSettings.global.showVelocities = !eCollisionSettings.global.showVelocities;  
});

$("#btn-run-pause").click(function() {
    if (ecollision.paused)
        ecollision.resume();
    else
        ecollision.pause();

    changeRunPauseBtn();
});

function changeRunPauseBtn() {
    if (!ecollision.paused) {
        $("#btn-run-pause").removeClass('icon-playback-play').addClass('icon-pause').text("PAUSE");
    } else {
        $("#btn-run-pause").removeClass('icon-pause').addClass('icon-playback-play').text("RUN");
    }
}

$("#btn-next").click(function() {
    ecollision.update();
});

var savedState = [];

$("#btn-save").click(function() {
    savedState = [];
    ecollision.simulationUI.saveParticles(savedState);
});

$("#btn-load").click(function() {
    ecollision.simulationUI.loadParticles(savedState);
});

$("#btn-reset").click(function() {
    ecollision.restart();
});

$("#sim-speed-slider").sliderEx({
    slide: function(event, ui) {
        eCollisionSettings.global.speedConst = parseFloat(ui.value);
    }
});

var fpsDiv = $("#fps-div");
var particleInfo = $("#particle-info-box");

ecollision.simulationUI.onSelect = function(particle) {
    $("#slider-mass").sliderEx("value", particle.mass);
    $("#slider-cor").sliderEx("value", particle.cOR);
}

ecollision.onTick = function() {
    if (eCollisionSettings.global.showVelocities) {
        var fps = "";
        if (ecollision.fps < 24) {
            fps = setCol(ecollision.fps, "red");
        } else {
            fps = setCol(ecollision.fps, "green");

        }
        debugStr = "Frame rate: " + fps + " Hz" +
                   "<br /> Update rate: " + setColGreen(ecollision.getUpdateRate()) + " Hz" +
                   "<br /> Energy in system: " + setColGreen(ecollision.graphUI.getEnergy()) + " kJ" +
                   "<br /> Number of particles: " + setColGreen(ecollision.engine.numOfParticles());
                   
        fpsDiv.html(debugStr);
    } else fpsDiv.html("");

    var selected = ecollision.simulationUI.getSelected();
    if (selected != null) {
        var str = "<b>XVel:</b> " + Math.round(selected.xVel*eCollisionSettings.global.updateRate) + " px/s" + 
                  "<br /> <b>YVel:</b> " + Math.round(selected.yVel*eCollisionSettings.global.updateRate) + " px/s" +
                  "<br /> <b>Direction:</b> " + Math.round(toDegrees(Math.atan2(selected.yVel, selected.xVel))) + " degrees" +
                  "<br /> <b>Mass:</b> " + selected.mass + " kg" +
                  "<br /> <b>CoR:</b> " + selected.cOR +
                  "<br /> <b>Radius:</b> " + selected.radius + " px"
                  "<br /> <b>Energy:</b> " + Math.round(selected.getEnergy()) + " J";
        
        particleInfo.html(str);
    } else {
        particleInfo.html("");
    }
}

ecollision.start();