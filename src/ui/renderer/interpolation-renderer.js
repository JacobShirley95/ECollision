/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let InterpolationRenderer;
import Renderer from "./renderer";

export default (InterpolationRenderer = class InterpolationRenderer extends Renderer {
	constructor() {
		{
		  // Hack: trick Babel/TypeScript into allowing this before super.
		  if (false) { super(); }
		  let thisFn = (() => { this; }).toString();
		  let thisName = thisFn.slice(thisFn.indexOf('{') + 1, thisFn.indexOf(';')).trim();
		  eval(`${thisName} = this;`);
		}
		this.interpolatables = [];
	}

	addInterpolatable(interpolatable) {
		return this.interpolatables.push(interpolatable);
	}

	removeInterpolatable(interpolatable) {
		return (() => {
			const result = [];
			for (let i = 0; i < this.interpolatables.length; i++) {
				const interpol = this.interpolatables[i];
				if (interpol === interpolatable) {
					interpolatables.splice(i, 1);
					break;
				} else {
					result.push(undefined);
				}
			}
			return result;
		})();
	}

	draw(interpolation) {
		return Array.from(this.interpolatables).map((interpol) =>
			interpol.interpolate(interpolation));
	}
});
