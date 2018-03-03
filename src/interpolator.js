/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Interpolator;
const EventManager = require("./events/event-manager");

module.exports = (Interpolator = (function() {
	Interpolator = class Interpolator {
		static initClass() {
			this.prototype.interpolation = 0.0;
			this.prototype.lockFPS = false;
		}

		constructor(renderRate, updateRate) {
			this.update = this.update.bind(this);
			this.renderRate = renderRate;
			this.updateRate = updateRate;
			this.startTime = new Date().getTime();
			this.updateTime = 1000.0 / this.updateRate;
			this.renderTime = 1000.0 / this.renderRate;

			this.curTime = (this.lastTime = (this.timeStamp = 0));
			this.thread = 0;

			EventManager.eventify(this);
		}

		start() {
			return this.thread = setInterval(this.update, this.updateTime);
		}

		static interpolate(startVal, endVal, fraction) {
			return startVal + (fraction*(endVal-startVal));
		}

		update() {
			if (this.lockFPS) {
				this.curTime = new Date().getTime() - this.startTime;
			} else {
				this.curTime += this.renderTime;
			}

			if ((this.curTime - this.lastTime) >= this.updateTime) {
				this.fire("before-update");
				this.timeStamp = this.curTime;

				while ((this.curTime - this.lastTime) >= this.updateTime) {
					this.fire("update");
					this.lastTime += this.updateTime;
				}

				this.fire("after-update");
			}

			this.interpolation = Math.min(1.0, (this.curTime - this.timeStamp) / this.updateTime);
			return this.fire("render", [this.interpolation]);
		}
	};
	Interpolator.initClass();
	return Interpolator;
})());

		





