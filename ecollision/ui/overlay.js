function Overlay(canvasName, simulation, settings) {
    Widget.call(this, canvasName);
    this.hide();

    var INDEX_PLACE = 0;
    var INDEX_VELOCITY = 1;
    var INDEX_MODIFY = 2;

    var MODE_ADD = 0;
    var MODE_EDIT = 1;

    var index = 0;

    var mode = -1;
    
    var mouseX = crossX = this.width/2;
    var mouseY = crossY = this.height/2;
    
    var velocityLine = new createjs.Shape();
    var infoText = new createjs.Text("", "bold 15px Arial");
    var errorText = new createjs.Text("", "bold 15px Arial", "red");
    var errorTimer = 0;
    var showError = false;

    var modeText = new createjs.Text("", "bold 15px Arial");
    modeText.x = (this.width/2)-40;
    modeText.y = 10;

    var freePlace = false;
    var copyPlace = false;

    var lastX = 0;
    var lastY = 0;

    var tempObject = null;

    function gcd(a, b) {
        if ( ! b) {
            return a;
        }
        return gcd(b, a % b);
    }

    var interval = gcd(this.width, this.height);

    var overlay = this; //so that i can refer to this object inside nested functions - javascript problem solved
    
    function handleMouseWheel(ev) {
        var d = ev.deltaY;
        if (d < 0) {
            if (tempObject.radius > settings.minRadius) {
                tempObject.radius -= 1;
            }
        } else {
            if (tempObject.radius < settings.maxRadius) {
                tempObject.radius += 1;
            }
        }
    }

    this.canvas.mousewheel(handleMouseWheel);

    this.resize = function(width, height) {
        interval = gcd(this.width, this.height);
    }
    
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

    function handleMouseMove(ev) {
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
                for (var i = 0; i < simulation.engine.numOfParticles(); i++) {
                    var p = simulation.engine.getParticle(i);
                    
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
    }
    
    this.stage.addEventListener("stagemousemove", handleMouseMove);

    function handleClick(ev) {
        if (ev.button == 2 && index != INDEX_MODIFY) {
            switch (index) {
                case INDEX_PLACE:
                    overlay.end();
                    break;

                case INDEX_VELOCITY:
                    break;
            }
            reset();
        } else {
            switch(index) {
                case INDEX_PLACE:
                    velocityLine.graphics.clear();
                
                    overlay.stage.addChild(velocityLine);
                    overlay.stage.addChild(infoText);
                    

                    index = INDEX_VELOCITY;

                    break;
                case INDEX_VELOCITY:
                    try {
                        var p = simulation.addParticle(tempObject.x, tempObject.y, tempObject.mass, tempObject.radius, tempObject.style);
                    
                        p.xVel = tempObject.xVel;
                        p.yVel = tempObject.yVel;
                        p.cOR = tempObject.cOR;
                        
                        overlay.stage.removeChild(velocityLine);
                        overlay.stage.removeChild(infoText);

                        tempObject.xVel = tempObject.yVel = 0;

                        if (mode == MODE_EDIT && !copyPlace) {
                            index = INDEX_MODIFY;
                            overlay.stage.removeChild(tempObject.displayObj);
                        } else 
                            index = INDEX_PLACE;
                    } catch (e) {
                        errorText.text = e;
                        errorText.x = overlay.width-(errorText.getMeasuredWidth());
                        errorText.y = overlay.height/2;
                        overlay.stage.addChild(errorText);
                        errorTimer = settings.errorTime;
                        showError = true;
                    }
                    break;
                case INDEX_MODIFY:
                    tempObject.displayObj.dispatchEvent("click");
                    if (ev.button == 2) {
                        simulation.removeSelected();
                    } else {
                        var selected = tempObject;

                        tempObject = selected.copy();

                        lastX = selected.x;
                        lastY = selected.y;

                        overlay.stage.addChild(tempObject.displayObj);

                        if (!copyPlace)
                            simulation.removeSelected();

                        index = INDEX_PLACE;
                    }

                    break;
            }
        }
        ev.stopPropagation();
    }

    this.canvas.mousedown(handleClick);
    
    this.draw = function(interpolation) {
        if (!this.hidden) {
            if (tempObject != null) {
                tempObject.draw(tempObject.x, tempObject.y);
            }

            if (showError) {
                errorTimer -= 1000/settings.updateRate;
                if (errorTimer <= 0) {
                    showError = false;

                    this.stage.removeChild(errorText);
                }
            }
                
            this.stage.update();
        }
    }
    
    function reset() {
        if (mode == MODE_EDIT) {
            var p = simulation.addParticle(lastX, lastY, tempObject.mass, tempObject.radius, tempObject.style);

            p.xVel = tempObject.xVel;
            p.yVel = tempObject.yVel;

            overlay.removeChild(tempObject.displayObj);
            tempObject = null;

            index = INDEX_MODIFY;
        } else {
            overlay.stage.removeChild(velocityLine);
            overlay.stage.removeChild(infoText);
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