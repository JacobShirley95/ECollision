function Overlay(canvasName, simulation, settings) {
    Widget.call(this, canvasName);
    this.hide();

    var INDEX_PLACE = 0;
    var INDEX_VELOCITY = 1;
    var INDEX_MODIFY = 2;

    var index = 0;

    var MODE_ADD = 0;
    var MODE_EDIT = 1;

    var mode = -1;
    
    var mouseX = crossX = this.width/2;
    var mouseY = crossY = this.height/2;
    
    var velocityLine = new createjs.Shape();
    var infoText = new createjs.Text("", "bold 15px Arial");

    var modeText = new createjs.Text("", "bold 15px Arial");
    modeText.x = (this.width/2)-40;
    modeText.y = 10;

    var interval = 50;

    var freePlace = false;
    var copyPlace = false;

    var minRadius = 5;
    var maxRadius = 80;

    var lastX = 0;
    var lastY = 0;

    var stage = this.stage;
    var tempObject = null;
    
    this.canvas.mousewheel(function(event) {
        var d = event.deltaY;
        if (d < 0) {
            if (tempObject.radius > minRadius) {
                tempObject.radius -= 1;
            }
        } else {
            if (tempObject.radius < maxRadius) {
                tempObject.radius += 1;
            }
        }
    });
    
    $(document).keydown(function(event) {
        freePlace = event.ctrlKey;
        copyPlace = event.shiftKey;
    });
    
    $(document).keyup(function(event) {
        freePlace = false;
        copyPlace = false;
    });
    
    this.canvas.bind('contextmenu', function(e){
        return false;
    }); 

    this.init = function() {
        this.stage.removeAllChildren();

        mouseX = crossX = this.width/2;
        mouseY = crossY = this.height/2;

        this.stage.addChild(modeText);
    }
    
    this.stage.addEventListener("stagemousemove", function (ev) {
        mouseX = crossX = ev.stageX;
        mouseY = crossY = ev.stageY;
        
        if (!freePlace) {
            var gridX = Math.round(mouseX/interval);
            var gridY = Math.round(mouseY/interval);
            
            crossX = gridX*interval;
            crossY = gridY*interval;
        }
        
        switch (index) {
            case INDEX_PLACE:
                velocityLine.x = crossX;
                velocityLine.y = crossY;
                
                if (tempObject != null) {
                    tempObject.x = crossX;
                    tempObject.y = crossY;
                }
                
                infoText.x = crossX-50;
                infoText.y = crossY-50;

                break;
            case INDEX_VELOCITY:
                var g = velocityLine.graphics;
            
                var dx = crossX-velocityLine.x;
                var dy = crossY-velocityLine.y;
                
                infoText.x = velocityLine.x + (dx/2);
                infoText.y = velocityLine.y + (dy/2);
                infoText.text = Math.round(Math.sqrt(dx*dx + dy*dy)) + " px/s";
                
                tempObject.xVel = dx/settings.updateRate;
                tempObject.yVel = dy/settings.updateRate;
                
                g.clear().beginStroke("red").setStrokeStyle(3).moveTo(0, 0).lineTo(dx, dy);

                break;
            case INDEX_MODIFY:
                var particles = simulation.engine.particles;
                
                for (var i = 0; i < particles.length; i++) {
                    var p = particles[i];
                    
                    var dx = p.x-mouseX;
                    var dy = p.y-mouseY;
                    if (dx*dx + dy*dy <= p.radius*p.radius) {
                        p.select();
                        
                        tempObject = p;
                    } else {
                        p.deselect();
                    }
                }

                break;
        }
    });

    this.stage.addEventListener("stagemousedown", function (ev) {
        if (ev.nativeEvent.button == 2 && (index == INDEX_PLACE || index == INDEX_VELOCITY)) {
            reset();
        } else {
            switch(index) {
                case INDEX_PLACE:
                    velocityLine.graphics.clear();
                
                    stage.addChild(velocityLine);
                    stage.addChild(infoText);
                    
                    index = INDEX_VELOCITY;

                    break;
                case INDEX_VELOCITY:
                    var p = simulation.addParticle(tempObject.x, tempObject.y, tempObject.mass, tempObject.radius, tempObject.style);
                
                    p.xVel = tempObject.xVel;
                    p.yVel = tempObject.yVel;
                    p.cOR = tempObject.cOR;
                    
                    stage.removeChild(velocityLine);
                    stage.removeChild(infoText);

                    if (mode == MODE_EDIT && !copyPlace) {
                        index = INDEX_MODIFY;
                        stage.removeChild(tempObject.displayObj);
                    } else 
                        index = INDEX_PLACE;

                    break;
                case INDEX_MODIFY:
                    tempObject.displayObj.dispatchEvent("click");
                    if (ev.nativeEvent.button == 2) {
                        simulation.removeSelected();
                    } else {
                        var selected = simulation.getSelected();

                        tempObject = new Particle(crossX, crossY, tempObject.radius, tempObject.style, settings);
                        tempObject.xVel = selected.xVel;
                        tempObject.yVel = selected.yVel;
                        tempObject.mass = selected.mass;
                        tempObject.cOR = selected.cOR;

                        lastX = selected.x;
                        lastY = selected.y;

                        stage.addChild(tempObject.displayObj);
                        simulation.removeSelected();

                        index = INDEX_PLACE;
                    }

                    break;
            }
        }
    });
    
    this.draw = function(interpolation) {
        if (!this.hidden) {
            if (tempObject != null) {
                //infoText.text = "Radius: "+tempObject.radius;
                tempObject.draw(tempObject.x, tempObject.y);
            }
                
            this.stage.update();
        }
    }
    
    function reset() {
        if (mode == MODE_EDIT) {
            var p = simulation.addParticle(lastX, lastY, tempObject.mass, tempObject.radius, tempObject.style);

            p.xVel = tempObject.xVel;
            p.yVel = tempObject.yVel;

            stage.removeChild(tempObject.displayObj);
            tempObject = null;

            index = INDEX_MODIFY;
        } else {
            stage.removeChild(velocityLine);
            index = INDEX_PLACE;
        }
    }
    
    this.beginAdd = function(mass, cOR, style) {
        this.show();
        this.init();

        tempObject = new Particle(crossX, crossY, 25, style, settings);
        tempObject.mass = mass;
        tempObject.cOR = cOR;
        
        infoText.x = mouseX;
        infoText.y = mouseY;

        this.stage.addChild(tempObject.displayObj);

        modeText.text = "Mode: Add";

        index = INDEX_PLACE;
        mode = MODE_ADD;
    }
    
    this.beginEdit = function() {
        this.show();
        this.init();

        modeText.text = "Mode: Edit";

        index = INDEX_MODIFY;
        mode = MODE_EDIT;
    }

    this.end = function() {
        this.hide();
        this.stage.removeAllChildren();
        if (tempObject != null) {
            tempObject = null;
        }
        mode = -1;

        freePlace = false;
        copyPlace = false;
    }

    this.getCurrentParticle = function() {
        return tempObject;
    }

    this.getMode = function() {
        return mode;
    }
}

Overlay.prototype = new Widget();