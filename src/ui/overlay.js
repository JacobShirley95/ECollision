/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Overlay;
import Widget from "./widget";
import Particle from "../objects/particle";

var gcd = function(a, b) {
    if (!b) { 
        return a;
    }
    
    return gcd(b, a % b);
};

export default (Overlay = (function() {
    Overlay = class Overlay extends Widget {
        static initClass() {
            this.INDEX_PLACE = 0;
            this.INDEX_VELOCITY = 1;
            this.INDEX_MODIFY = 2;
    
            this.MODE_ADD = 0;
            this.MODE_EDIT = 1;
        
            this.prototype.errorTimer = 0;
            this.prototype.showError = false;
    
            this.prototype.tempObject = null;
        }

        constructor(canvasName, simulation, settings) {
            {
              // Hack: trick Babel/TypeScript into allowing this before super.
              if (false) { super(); }
              let thisFn = (() => { this; }).toString();
              let thisName = thisFn.slice(thisFn.indexOf('{') + 1, thisFn.indexOf(';')).trim();
              eval(`${thisName} = this;`);
            }
            this.handleMouseWheel = this.handleMouseWheel.bind(this);
            this.handleMouseMove = this.handleMouseMove.bind(this);
            this.handleClick = this.handleClick.bind(this);
            this.simulation = simulation;
            this.settings = settings;
            super(canvasName);

            this.modeText = new createjs.Text("", "bold 15px Arial");
            this.modeText.x = 0;
            this.modeText.y = 10;

            this.velocityLine = new createjs.Shape();
            this.velText = new createjs.Text("", "bold 15px Arial");
            this.errorText = new createjs.Text("", "bold 15px Arial", "red");

            this.mouseX = (this.crossX = this.width/2);
            this.mouseY = (this.crossY = this.height/2);

            this.mode = -1;
            this.index = 0;

            this.modeText.x = (this.width/2)-40;

            this.interval = gcd(this.width, this.height);

            this.hide();

            $(document).keydown(event => { 
                this.freePlace = event.ctrlKey;
                return this.copyPlace = event.shiftKey;
            });
        
            $(document).keyup(event => { 
                this.freePlace = false;
                return this.copyPlace = false;
            });
        
            this.canvas.bind('contextmenu', e => false);

            this.mouseX = (this.crossX = this.width/2);
            this.mouseY = (this.crossY = this.height/2);

            this.stage.addEventListener("stagemousemove", this.handleMouseMove);

            this.canvas.mousedown(this.handleClick);
            this.canvas.mousewheel(this.handleMouseWheel);
        }

        resize(width, height) {
            return this.interval = gcd(this.width, this.height);
        }

        init() { 
            this.stage.removeAllChildren();

            this.simulation.renderer.removeParticle(this.tempObject);

            this.mouseX = (this.crossX = this.width/2);
            this.mouseY = (this.crossY = this.height/2);

            return this.stage.addChild(this.modeText);
        }

        handleMouseWheel(ev) { 
            const d = ev.deltaY;
            if (d < 0) { 
                if (this.tempObject.radius > this.settings.global.minRadius) { 
                    return this.tempObject.radius -= 1;
                }
            
             } else { 
                if (this.tempObject.radius < this.settings.global.maxRadius) { 
                    return this.tempObject.radius += 1;
                }
            }
        }

        handleMouseMove(ev) { 
            this.mouseX = (this.crossX = ev.stageX);
            this.mouseY = (this.crossY = ev.stageY);
        
            if (!this.freePlace) { 
                const gridX = Math.round(this.mouseX/this.interval);
                const gridY = Math.round(this.mouseY/this.interval);
            
                this.crossX = gridX*this.interval;
                this.crossY = gridY*this.interval;
            }

            switch (this.index) { 
                case Overlay.INDEX_PLACE:
                    this.velocityLine.x = this.crossX;
                    this.velocityLine.y = this.crossY;
                
                    if (this.tempObject !== null) { 
                        this.tempObject.x = this.crossX;
                        this.tempObject.y = this.crossY;
                    }
                
                    this.velText.x = this.crossX;
                    this.velText.y = this.crossY;

                    break;
                case Overlay.INDEX_VELOCITY:
                    var g = this.velocityLine.graphics;
            
                    var dx = this.crossX-this.velocityLine.x;
                    var dy = this.crossY-this.velocityLine.y;
                
                    this.velText.x = this.velocityLine.x + (dx/2);
                    this.velText.y = this.velocityLine.y + (dy/2);
                    this.velText.text = Math.round(Math.sqrt((dx*dx) + (dy*dy))) + " px/s";
                
                    this.tempObject.xVel = dx/this.settings.global.updateRate;
                    this.tempObject.yVel = dy/this.settings.global.updateRate;
                
                    g.clear().beginStroke("red").setStrokeStyle(3).moveTo(0, 0).lineTo(dx, dy);

                    break;
            }
        }

        handleClick(ev) { 
            if ((ev.button === 2) && (this.index !== Overlay.INDEX_MODIFY)) { 
                switch (this.index) { 
                    case Overlay.INDEX_PLACE:
                        this.end();
                        break;

                    case Overlay.INDEX_VELOCITY:
                        break;
                }
            
                this.reset();
            } else { 
                switch(this.index) { 
                    case Overlay.INDEX_PLACE:
                        this.velocityLine.graphics.clear();
                
                        this.stage.addChild(this.velocityLine);
                        this.stage.addChild(this.velText);

                        this.index = Overlay.INDEX_VELOCITY;

                        break;
                    case Overlay.INDEX_VELOCITY:
                        var p = this.simulation.addParticle(this.tempObject.x, this.tempObject.y, this.tempObject.mass, this.tempObject.radius, this.tempObject.style);
                
                        p.xVel = this.tempObject.xVel;
                        p.yVel = this.tempObject.yVel;
                        p.cOR = this.tempObject.cOR;
                    
                        this.stage.removeChild(this.velocityLine);
                        this.stage.removeChild(this.velText);

                        this.tempObject.xVel = (this.tempObject.yVel = 0);

                        if ((this.mode === Overlay.MODE_EDIT) && !this.copyPlace) { 
                            this.index = Overlay.INDEX_MODIFY;
                            this.simulation.renderer.removeParticle(this.tempObject);
                        } else { 
                            this.index = Overlay.INDEX_PLACE;
                        }

                        break;
                    case Overlay.INDEX_MODIFY:
                        var possibles = this.simulation.renderer.getParticlesAtPos(this.mouseX, this.mouseY);
                        if (possibles.length > 0) {
                            const selected = possibles[0].particle;

                            this.simulation.removeParticle(selected);
                            if (ev.button !== 2) {
                                this.tempObject = selected.copy();

                                this.particleRenderer = this.simulation.renderer.addParticle(this.tempObject);

                                if (!this.copyPlace) {
                                    this.simulation.removeSelected();
                                }

                                this.index = Overlay.INDEX_PLACE;
                            }
                        }

                        break;
                }
            }
        
            return ev.stopPropagation();
        }
    
        draw(interpolation) {
            if (!this.hidden) { 
                if (this.index === Overlay.INDEX_MODIFY) {
                    for (let p of Array.from(this.simulation.renderer.getParticles())) {
                        if (this.simulation.renderer.isParticleAtPos(p, this.mouseX, this.mouseY)) {
                            p.select();
                        } else {
                            p.deselect();
                        }
                    }
                }

                if (this.showError) { 
                    this.errorTimer -= 1000/this.settings.global.updateRate;
                    if (this.errorTimer <= 0) { 
                        this.showError = false;

                        this.stage.removeChild(this.errorText);
                    }
                }
                
                return this.stage.update();
            }
        }
    
        reset() {
            this.stage.removeChild(this.velocityLine);
            this.stage.removeChild(this.velText);
            return this.index = Overlay.INDEX_PLACE;
        }
    
        beginAdd(mass, cOR, style) {
            this.show();
            this.init();

            this.tempObject = new Particle(this.crossX, this.crossY, 25, style, this.settings);
            this.tempObject.mass = mass;
            this.tempObject.cOR = cOR;

            this.particleRenderer = this.simulation.renderer.addParticle(this.tempObject);
        
            this.velText.x = this.mouseX;
            this.velText.y = this.mouseY;

            this.modeText.text = "Mode: Add";

            this.index = Overlay.INDEX_PLACE;
            return this.mode = Overlay.MODE_ADD;
        }
    
        beginEdit() {
            this.show();
            this.init();

            this.modeText.text = "Mode: Edit";

            this.index = Overlay.INDEX_MODIFY;
            return this.mode = Overlay.MODE_EDIT;
        }

        end() {
            this.hide();
        
            this.simulation.renderer.removeParticle(this.tempObject);

            this.tempObject = null;
        
            this.mode = -1;

            this.freePlace = false;
            return this.copyPlace = false;
        }

        getCurrentParticle() {
            return this.tempObject;
        }

        getMode() {
            return this.mode;
        }
    };
    Overlay.initClass();
    return Overlay;
})());