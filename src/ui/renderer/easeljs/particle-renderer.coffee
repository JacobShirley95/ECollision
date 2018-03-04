import Renderer from "../renderer";
import Point2D from "../../../math/point-2d";
import EventManager from "../../../events/event-manager";
import Interpolator from "../../../interpolator";

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

		@graphics = @displayObj.graphics
		@graphics.clear().beginFill(@particle.style).drawCircle(0, 0, @particle.radius).endFill()

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
		
