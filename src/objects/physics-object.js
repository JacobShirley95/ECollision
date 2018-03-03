/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let PhysicsObject;
import EventManager from "../events/event-manager";

export default (PhysicsObject = (function() {
    PhysicsObject = class PhysicsObject {
        static initClass() {
            this.prototype.xVel =0;
            this.prototype.yVel =0;
        }

        constructor(x, y, mass) {
            this.x = x;
            this.y = y;
            this.mass = mass;
            this.lastX = this.x;
            this.lastY = this.y;

            EventManager.eventify(this);
        }

        capture() {
            this.lastX = this.x;
            return this.lastY = this.y;
        }

        update() {
            this.x += this.xVel;
            return this.y += this.yVel;
        }
    
        getEnergy() { 
            return 0.5 * this.mass * ((this.xVel*this.xVel) + (this.yVel*this.yVel));
        }
    };
    PhysicsObject.initClass();
    return PhysicsObject;
})());