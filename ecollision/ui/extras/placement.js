function Placement(canvasName, simulation) {
    Widget.call(this, canvasName);
    this.hidden = true;

    var INDEX_PLACE = 0;
    var INDEX_VELOCITY = 1;
    var INDEX_MODIFY = 2;

    var index = 0;

    var MODE_ADD = 0;
    var MODE_EDIT = 1;

    var mode = -1;
    
    var sim = simulation;
    
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
        if (event.charCode == 27) {
            this.end();
            return;
        }
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
                
                tempObject.x = crossX;
                tempObject.y = crossY;
                
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
                
                tempObject.xVel = dx/sim.getUpdateRate();
                tempObject.yVel = dy/sim.getUpdateRate();
                
                g.clear().beginStroke("red").setStrokeStyle(3).moveTo(0, 0).lineTo(dx, dy);

                break;
            case INDEX_MODIFY:
                var particles = sim.particles;
                
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
        if (ev.nativeEvent.button == 2 && (index == 0 || index == 1)) {
            reset();
        } else {
            switch(index) {
                case INDEX_PLACE:
                    velocityLine.graphics.clear();
                
                    stage.addChild(velocityLine);
                    stage.addChild(infoText);
                    
                    index++;

                    break;
                case INDEX_VELOCITY:
                    var p = sim.addParticle(tempObject.x, tempObject.y, tempObject.mass, tempObject.radius, tempObject.style);
                
                    p.xVel = tempObject.xVel;
                    p.yVel = tempObject.yVel;
                    
                    stage.removeChild(velocityLine);
                    stage.removeChild(infoText);

                    if (mode == MODE_EDIT && !copyPlace) {
                        index = 2;
                        stage.removeChild(tempObject.displayObj);
                    } else 
                        index = 0;
                    break;
                case INDEX_MODIFY:
                    tempObject.displayObj.dispatchEvent("click");
                    if (ev.nativeEvent.button == 2) {
                        sim.removeSelected();
                    } else {
                        var selected = sim.getSelected();

                        tempObject = new Particle(crossX, crossY, tempObject.radius, tempObject.style);
                        tempObject.xVel = selected.xVel;
                        tempObject.yVel = selected.yVel;
                        tempObject.mass = selected.mass;
                        tempObject.cOR = selected.cOR;

                        lastX = selected.x;
                        lastY = selected.y;

                        stage.addChild(tempObject.displayObj);
                        sim.removeSelected();

                        index = 0;
                    }
                    break;
            }
        }
    });
    
    this.draw = function() {
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
            var p = sim.addParticle(lastX, lastY, tempObject.mass, tempObject.radius, tempObject.style);

            p.xVel = tempObject.xVel;
            p.yVel = tempObject.yVel;

            stage.removeChild(tempObject.displayObj);
            tempObject = null;

            index = 2;
        } else {
            stage.removeChild(velocityLine);
            index = 0;
        }
    }
    
    this.beginAdd = function(mass, cOR, style) {
        this.show();
        this.init();

        tempObject = new Particle(crossX, crossY, 25, style);
        tempObject.mass = mass;
        tempObject.cOR = cOR;
        
        infoText.x = mouseX;
        infoText.y = mouseY;

        this.stage.addChild(tempObject.displayObj);

        modeText.text = "Mode: Add";

        index = 0;
        mode = 0;
    }
    
    this.beginEdit = function() {
        this.show();
        this.init();

        modeText.text = "Mode: Edit";

        index = 2;
        mode = 1;
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

Placement.prototype = new Widget();