/*
 * decaffeinate suggestions:
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ECollisionSettings;
module.exports = (ECollisionSettings = (function() {
	ECollisionSettings = class ECollisionSettings {
		static initClass() {
			this.prototype.global = {
				refreshRate: 24,
				updateRate: 60,
				showVelocities: false,
				enableInterpolation: true,
				maxTraceLength: 30,
				speedConst: 1.0,
				maxParticles: 10000,
				minRadius: 5,
				maxRadius: 30,
				errorTime: 5000
			};
	
			this.prototype.simulation = {
				simulationWidth: 1000,
				simulationHeight: 1000,
				simulationCanvas: "simulation-canvas",
				enableSelection: true
			};
	
			this.prototype.graph = {
				graphCanvas: "graph-canvas",
				graphScaleX: 1/50,
				graphScaleY: 5,
				graphZoomFactor: 1.25,
				graphMinZoomIndex: 5,
				graphMaxZoomIndex: 5
			};
	
			this.prototype.overlay =
				{overlayCanvas: "overlay-canvas"};
		}
		constructor() {}
	};
	ECollisionSettings.initClass();
	return ECollisionSettings;
})());