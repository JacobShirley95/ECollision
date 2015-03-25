function Placement(canvasName, simulation) {
    Widget.call(this, canvasName);
    this.hidden = true;
    
    var sim = simulation;
    
    var mouseX = crossX = this.width/2;
    var mouseY = crossY = this.height/2;
    
    var crossHair = new createjs.Shape();
    var grid = new createjs.Shape();
    var velocityLine = new createjs.Shape();
    var infoText = new createjs.Text();
    
    var gridGraphics = grid.graphics;
    gridGraphics.beginStroke("black");
    
    var interval = 20;
    
    var addIndex = 0;
    
    var deleteMode = false;
    
    this.canvas.mousewheel(function(event) {
        var d = event.deltaY;
        if (d < 0) {
            tempObject.radius -= 1;
        } else {
            tempObject.radius += 1;
        }
    });
    
    this.canvas.bind('contextmenu', function(e){
        return false;
    }); 
    
    for (var i = 0; i < this.width/interval; i++) {
        gridGraphics.moveTo(i*interval, 0).lineTo(i*interval, this.height);
    }
    
    for (var i = 0; i < this.height/interval; i++) {
        gridGraphics.moveTo(0, i*interval).lineTo(this.width, i*interval);
    }
    
    this.getGridCoords = function (x, y) {
        
    }
    
    this.stage.addEventListener("stagemousemove", function (ev) {
        mouseX = ev.stageX;
        mouseY = ev.stageY;
        
        if (addIndex == 0) {
            var gridX = Math.round(mouseX/interval);
            var gridY = Math.round(mouseY/interval);
            
            crossX = gridX*interval;
            crossY = gridY*interval;
            
            velocityLine.x = crossX;
            velocityLine.y = crossY;
            
            tempObject.x = crossX;
            tempObject.y = crossY;
            
            infoText.x = crossX;
            infoText.y = crossY;

            showCrossHair();
        } else if (addIndex == 1) {
            var gridX = Math.round(mouseX/interval);
            var gridY = Math.round(mouseY/interval);
            
            var crossX2 = gridX*interval;
            var crossY2 = gridY*interval;
            
            var g = velocityLine.graphics;
            
            var dx = crossX2-velocityLine.x;
            var dy = crossY2-velocityLine.y;
            
            tempObject.xVel = dx/sim.getUpdateRate();
            tempObject.yVel = dy/sim.getUpdateRate();
            
            g.clear().beginStroke("red").setStrokeStyle(3).moveTo(0, 0).lineTo(dx, dy);
        } else if (addIndex == 2) {
            
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
        }
    });
    
    var t = this;
    
    this.stage.addEventListener("stagemousedown", function (ev) {
        if (ev.nativeEvent.button == 2) {
            reset();
        } else {
            if (addIndex == 0) {
                velocityLine.graphics.clear();
                
                stage.addChild(velocityLine);
                
                addIndex++;
            } else if (addIndex == 1) {
                var p = sim.addParticle(tempObject.x, tempObject.y, tempObject.mass, tempObject.radius, tempObject.style);
                
                p.xVel = tempObject.xVel;
                p.yVel = tempObject.yVel;
                
                stage.removeChild(velocityLine);
                
                addIndex = 0;
            }  else if (addIndex == 2) {
                tempObject.displayObj.dispatchEvent("click");
                sim.removeSelected();
            }
        }
    });
    
    this.draw = function() {
        if (!this.hidden) {
            if (tempObject != null) {
                infoText.text = "Radius: "+tempObject.radius;
                tempObject.draw(crossX, crossY);
            }
                
            this.stage.update();
        }
    }
    
    var stage = this.stage;
    var w = this.width;
    var h = this.height;
    
    function showCrossHair() {
        crossHair.graphics.clear().beginStroke(3).beginStroke("red").moveTo(0, crossY).lineTo(w, crossY);
        crossHair.graphics.beginStroke("red").moveTo(crossX, 0).lineTo(crossX, h);
    }
    
    var tempObject = null;
    
    function reset() {
        stage.removeChild(velocityLine);
        addIndex = 0;
    }
    
    this.beginAdd = function(mass, radius, style) {
        this.stage.removeAllChildren();
        
        addIndex = 0;
        
        mouseX = crossX = this.width/2;
        mouseY = crossY = this.height/2;
    
        tempObject = new Particle(crossX, crossY, radius, style);
        tempObject.mass = mass;
        
        infoText.x = mouseX;
        infoText.y = mouseY;
        
        this.stage.addChild(grid);
        this.stage.addChild(crossHair);
        this.stage.addChild(tempObject.displayObj);
        this.stage.addChild(infoText);
    }
    
    this.beginDelete = function() {
        addIndex = 2;
        
        this.stage.removeAllChildren();

        mouseX = crossX = this.width/2;
        mouseY = crossY = this.height/2;
        
        this.stage.addChild(grid);
        this.stage.addChild(crossHair);
    }
    
    showCrossHair();
}

Placement.prototype = new Widget();