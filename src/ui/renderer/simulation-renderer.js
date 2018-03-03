/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let SimulationRenderer;
import Renderer from "./renderer";

export default (SimulationRenderer = class SimulationRenderer extends Renderer {
	constructor(canvas, interpolator) {
		{
		  // Hack: trick Babel/TypeScript into allowing this before super.
		  if (false) { super(); }
		  let thisFn = (() => { this; }).toString();
		  let thisName = thisFn.slice(thisFn.indexOf('{') + 1, thisFn.indexOf(';')).trim();
		  eval(`${thisName} = this;`);
		}
		this.canvas = canvas;
		this.interpolator = interpolator;
	}

	addParticle(particle) {}

	removeParticle(particle) {}
});