Renderer = require("../renderer")
Point2D = require("../../../math/point-2d")
EventManager = require("../../../events/event-manager")

module.exports = class ParticleRenderer extends Renderer
	pastPositions = []
	curPos = 0

	lastX = 0
	lastY = 0

	constructor: (@particle) ->
		@displayObj = new createjs.Shape()

		lastX = @particle.x
		lastY = @particle.y

		@displayObj.x = @particle.x
		@displayObj.y = @particle.y
		@displayObj.addEventListener("click", (ev) =>
			if (@selected)
				@fire("deselect", [ev, @])
			else
		    	@fire("select", [ev, @])
		    	
		    @selected = !@selected
		)

		@particle.addListener("update", (ev) =>
			@capture()

			len = pastPositions.length
			if (@selected) 
			    curPos++
			    curPos %= 20
			    if (len < 20) 
			        pastPositions.push(new Point2D(@x, @y))
			     else 
			        pastPositions[curPos] = new Point2D(@x, @y)
		)

		@selected = false

		EventManager.eventify(@)

	capture: ->
        lastX = @particle.x
        lastY = @particle.y

	select: ->
        @selected = true
    
    deselect: ->
        @selected = false
        @particle.pastPositions = []

	draw: (interpolation) ->
		newX = @particle.x
		newY = @particle.y

		newX = lastX + (interpolation * (newX - lastX))
		newY = lastY + (interpolation * (newY - lastY))

		@displayObj.x = newX
		@displayObj.y = newY

		graphics = @displayObj.graphics

		graphics.clear()

		if (@selected) 
		    len = pastPositions.length
		    for i in [0..len-1] by 1
		        p = pastPositions[(i + @particle.curPos) % len]
		        px = p.x-@particle.x
		        py = p.y-@particle.y

		        r_a = i / len

		        col = "rgba(100, 100, 100, "+r_a+")"
		        graphics.beginStroke(col).drawCircle(px, py, @particle.radius).endStroke()

		    graphics.beginStroke("blue").setStrokeStyle(3).drawCircle(0, 0, @particle.radius).endStroke()

		graphics.beginFill(@particle.style).drawCircle(0, 0, @particle.radius).endFill()
