import Renderer from "../renderer.js";
import Point2D from "../../../math/point-2d.js";
import EventManager from "../../../events/event-manager.js";
import Interpolator from "../../../interpolator.js";

export default class ParticleRenderer extends Renderer
	pastPositions: []
	curPos: 0

	constructor: (@particle, @enableSelection) ->
		super()
		@displayObj = new createjs.Shape()

		@lastX = @particle.x
		@lastY = @particle.y

		@selected = false

		@displayObj.x = @particle.x
		@displayObj.y = @particle.y
		@displayObj.addEventListener("click", (ev) =>
			if (@selected)
				@fire("deselect", [ev, @])
				@deselect()
			else
				@fire("select", [ev, @])
				@select()
		)

		r = @particle.radius

		@graphics = @displayObj.graphics
		@graphics.clear().beginFill(@particle.style).drawCircle(0, 0, @particle.radius).endFill()

		@displayObj.cache(-r,-r, r*2,r*2)

		EventManager.eventify(@)

	capture: ->
		@lastX = @particle.x
		@lastY = @particle.y

	select: ->
		@selected = true

	deselect: ->
		@selected = false
		@pastPositions = []

	draw: (interpolation) ->
		newX = @particle.x
		newY = @particle.y

		if (interpolation > 0.0)
			newX = Interpolator.interpolate(@lastX, newX, interpolation)
			newY = Interpolator.interpolate(@lastY, newY, interpolation)

		@displayObj.x = newX
		@displayObj.y = newY

		if (@particle.needsUpdate)
			@particle.needsUpdate = false
			@graphics.clear().beginFill(@particle.style).drawCircle(0, 0, @particle.radius).endFill()
