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

/*$("#colour-picker").spectrum({
    color: "#ff0000",
    showButtons: false,
    showInput:true,
    preferredFormat: "rgb",
    replacerClassName: 'colour-pickers'
});*/

$("#slider-mass").sliderEx({
    slide: function(event, ui) {
        var cp = placement.getCurrentParticle() || sim.getSelected();
        if (cp != null)
            cp.mass = ui.value;
    }
});
    
$("#slider-cor").sliderEx({
    slide: function(event, ui) {
        var cp = placement.getCurrentParticle() || sim.getSelected();
        if (cp != null)
            cp.coR = ui.value;
    }
});

function openAdd() {
    var mode = placement.getMode();
    if (mode == 0) {
        placement.end();
    } else {
        var mass = $("#slider-mass").sliderEx("value");
        var cOR = $("#slider-cor").sliderEx("value");

        placement.beginAdd(mass, cOR, currentColor);
    }
}

function openEdit() {
    var mode = placement.getMode();
    if (mode == 1) {
        placement.end();
    } else {
        var mass = $("#slider-mass").sliderEx("value");
        var cOR = $("#slider-cor").sliderEx("value");

        placement.beginEdit();
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
    var cp = placement.getCurrentParticle() || sim.getSelected();
    if (cp != null) {
        currentColor = getRandomColor();
        cp.style = currentColor;
    }
})

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

$("#trace").click(function() {
    enableTrace = !enableTrace;   
});

$("#sim-data").click(function() {
    enableColData = !enableColData;  
});

$("#btn-run-pause").click(function() {
    sim.paused = !sim.paused;
    changeRunPauseBtn();
});

function changeRunPauseBtn() {
    if (!sim.paused) {
        $("#btn-run-pause").removeClass('icon-run').addClass('icon-pause').text("PAUSE");
    } else {
        $("#btn-run-pause").removeClass('icon-pause').addClass('icon-run').text("RUN");
    }
}

$("#btn-next").click(function() {
    if (sim.paused) {
        sim.paused = false;
        ecollision.tick();
        sim.paused = true;
    }
});

var savedState = [];

$("#btn-save").click(function() {
    savedState = [];
    sim.saveParticles(savedState);
});

$("#btn-load").click(function() {
    console.log(savedState.length);
    sim.loadParticles(savedState);
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
        sim.setSpeedConst(parseFloat(ui.value));
    },
    stop: function(event, ui) {
        graph.updateData();
    }
});

var ecollision = new Ecollision();
ecollision.start();