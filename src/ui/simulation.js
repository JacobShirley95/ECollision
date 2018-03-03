/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Simulation;
import Widget from "./widget";
import Particle from '../objects/particle';
import EventManager from "../events/event-manager";
import EaselJSRenderer from "./renderer/easeljs/easeljs-renderer";

export default (Simulation = (function() {
    Simulation = class Simulation extends Widget {
        static initClass() {
            this.prototype.selected = null;
        }

        constructor(canvasName, engine, interpolator, settings) {
            {
              // Hack: trick Babel/TypeScript into allowing this before super.
              if (false) { super(); }
              let thisFn = (() => { this; }).toString();
              let thisName = thisFn.slice(thisFn.indexOf('{') + 1, thisFn.indexOf(';')).trim();
              eval(`${thisName} = this;`);
            }
            this.engine = engine;
            this.interpolator = interpolator;
            this.settings = settings;
            super(canvasName);
            this.engine.width = this.width;
            this.engine.height = this.height;

            this.renderer = new EaselJSRenderer(this.canvasName, this.interpolator, this.settings);

            EventManager.eventify(this);
        }

        resize(newWidth, newHeight) {
            return this.engine.setBounds(newWidth, newHeight);
        }
    
        addParticle(x, y, mass, radius, style) {
            const particle = new Particle(x, y, radius, style, this.settings);
            particle.mass = mass;

            this.renderer.addParticle(particle);

            particle.addListener("select", (ev, particle) => {
                return this.selected = particle;
            }).addListener("deselect", (ev, particle) => {
                return this.selected = null;
            });

            this.engine.particles.push(particle);
        
            return particle;
        }
    
        removeParticle(index) {
            if (typeof index === "object") {
                this.renderer.removeParticle(index);

                return (() => {
                    const result = [];
                    for (let i = 0; i < this.engine.particles.length; i++) {
                        const p = this.engine.particles[i];
                        if (p === index) {
                            this.engine.particles.splice(i, 1);
                            break;
                        } else {
                            result.push(undefined);
                        }
                    }
                    return result;
                })();
            } else {
                this.renderer.removeParticle(this.engine.particles[index]);
                return this.engine.particles.splice(index, 1);
            }
        }

        loadParticles(toBeLoaded) {
            this.restart();

            return (() => {
                const result = [];
                for (let obj of Array.from(toBeLoaded)) {
                    const particle = this.addParticle(obj.x, obj.y, obj.mass, obj.radius, obj.style);

                    particle.xVel = obj.xVel;
                    particle.yVel = obj.yVel;
                    result.push(particle.cOR = obj.cOR);
                }
                return result;
            })();
        }

        saveParticles(saved) {
            return Array.from(this.engine.particles).map((particle) =>
                saved.push(particle.copy()));
        }

        removeSelected() {
            if (this.selected !== null) {
                for (let i = 0; i < this.particles.length; i++) {
                    const particle = this.particles[i];
                    if (particle === this.selected) {
                        this.removeParticle(i);
                    }
                }

                return this.selected = null;
            }
        }

        getSelected() {
            return this.selected;
        }
    
        restart() {
            this.renderer.clear();
            this.selected = null;
            this.engine.reset();
            return this.fire("restart");
        }
    
        draw(interpolation) {
            this.renderer.draw(interpolation);

            return this.fire("draw");
        }
    };
    Simulation.initClass();
    return Simulation;
})());