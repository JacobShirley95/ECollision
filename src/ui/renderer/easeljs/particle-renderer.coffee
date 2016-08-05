Renderer = require("../renderer")
Point2D = require("../../../math/point-2d")
EventManager = require("../../../events/event-manager")
Interpolator = require("../../../interpolator")

module.exports = class ParticleRenderer extends Renderer
	pastPositions = []
	curPos = 0

	constructor: (@particle, @enableSelection) ->
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

		@tail = new createjs.Shape()
		@tail.x = @particle.x
		@tail.y = @particle.y

		#@displayObj.addChild(@tail)

		EventManager.eventify(@)

	capture: ->
        @lastX = @particle.x
        @lastY = @particle.y

		if (@enableSelection && @selected) 
		    curPos++
		    curPos %= 20

		    len = pastPositions.length
		    if (len < 20) 
		        pastPositions.push(new Point2D(@x, @y))
		     else 
		        pastPositions[curPos] = new Point2D(@x, @y)

	select: ->
        @selected = true
    
    deselect: ->
        @selected = false
        pastPositions = []

	draw: (interpolation) ->
		newX = @particle.x
		newY = @particle.y

		if (interpolation > 0.0)
			newX = Interpolator.interpolate(@lastX, newX, interpolation)
			newY = Interpolator.interpolate(@lastY, newY, interpolation)

		@displayObj.x = newX
		@displayObj.y = newY

		graphics = @displayObj.graphics
		graphics.clear().beginFill(@particle.style).drawCircle(0, 0, @particle.radius).endFill()

		if (@enableSelection && @selected)
			graphics.beginStroke("blue").setStrokeStyle(3).drawCircle(0, 0, @particle.radius).endStroke()

			graphics = @tail.graphics
			graphics.clear()
			len = pastPositions.length
			for i in [0..len-1] by 1
			    p = pastPositions[(i + @particle.curPos) % len]
			    px = p.x-@particle.x
			    py = p.y-@particle.y

			    r_a = i / len

			    col = "rgba(100, 100, 100, "+r_a+")"
				graphics.beginStroke(col).drawCircle(px, py, @particle.radius).endStroke()

