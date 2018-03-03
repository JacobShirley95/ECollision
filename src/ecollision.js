/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ECollision;
const SimulationEngine = require("./engine/simulation-engine");
const Simulation = require("./ui/simulation");
const Graph = require("./ui/graph");
const Overlay = require("./ui/overlay");
const ECollisionSettings = require("./settings");
const EventManager = require("./events/event-manager");
const Interpolator = require("./interpolator");

module.exports = (ECollision = (function() {
    let setUpdateRate = undefined;
    let setSpeedConst = undefined;
    ECollision = class ECollision {
        static initClass() {
        
            setUpdateRate = function(rate) {
                this.updateRate = rate;
                return this.updateTime = 1000.0 / this.updateRate;
            };
    
            setSpeedConst = function(speedConst) {
                return this.engine.speedConst = speedConst;
            };
        }
        constructor(settings) {
            this.tick = this.tick.bind(this);
            this.settings = settings;
            this.engine = new SimulationEngine(this.settings.simulation.simulationWidth, this.settings.simulation.simulationHeight, this.settings);

            this.interpol = new Interpolator(this.settings.global.refreshRate, this.settings.global.updateRate);
            this.interpol.lockFPS = true;

            this.simulationUI = new Simulation(this.settings.simulation.simulationCanvas, this.engine, this.interpol, this.settings);
            this.graphUI = new Graph(this.settings.graph.graphCanvas, this.engine, 1/50, 5, this.settings);
            this.overlayUI = new Overlay(this.settings.overlay.overlayCanvas, this.simulationUI, this.settings);

            this.paused = false;

            this.fpsCount = (this.fps = (this.fpsTime = 0));
            this.updateRate = (this.updateTime = (this.refreshTime = 0));

            this.widgets = [this.simulationUI, this.graphUI, this.overlayUI];

            this.interpol.addListener("update", () => {
                if (!this.paused) {
                    return this.update();
                }
            }).addListener("render", this.tick);

            this.updateRate = this.settings.global.updateRate;
            this.updateTime = 1000.0 / this.updateRate;
            this.refreshTime = 1000 / this.settings.global.refreshRate;

            EventManager.eventify(this);
        }

        start() {
            for (let widget of Array.from(this.widgets)) {
                widget.init();
            }
        
            return this.interpol.start();
        }

        restart() {
            return Array.from(this.widgets).map((widget) =>
                widget.restart());
        }

        resume() {
            this.paused = false;
        
            return Array.from(this.widgets).map((widget) =>
                widget.resume());
        }

        pause() {
            this.paused = true;

            return Array.from(this.widgets).map((widget) =>
                widget.pause());
        }

        stop() {
            if (this.thread !== -1) {
                clearInterval(this.thread);

                return this.thread = -1;
            }
        }

        getUpdateRate() {
            return this.updateRate;
        }
    
        getUpdateTime() {
            return this.updateTime;
        }

        update() {
            return this.engine.update();
        }
    
        tick(interpolation) {
            this.fpsCurTime = new Date().getTime();
            this.fpsCount++;

            if ((this.fpsCurTime - this.fpsTime) >= 1000) {
                this.fps = this.fpsCount;

                this.fpsCount = 0;
                this.fpsTime = this.fpsCurTime;
            }

            for (let widget of Array.from(this.widgets)) {
                widget.draw(interpolation);
            }

            return this.fire('tick', [interpolation]);
        }
    };
    ECollision.initClass();
    return ECollision;
})());