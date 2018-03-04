import EventManager from "./events/event-manager";

export default class Interpolator
	interpolation: 0.0
	lockFPS: false

	constructor: (@renderRate, @updateRate) ->
		@lastTime = new Date().getTime()
		@updateTime = 1000.0 / @updateRate
		@renderTime = 1000.0 / @renderRate
		@updateCatchup = @updateTime

		@started = false

		EventManager.eventify(@)

	start: ->
		@started = true
		@_start()

	_start: =>
		if (@started)
			@update()
			requestAnimationFrame(@_start)

	stop: ->
		@started = false

	@interpolate: (startVal, endVal, fraction) ->
		return startVal + (fraction*(endVal-startVal))

	update: =>
		if (@updateCatchup >= @updateTime)
			@fire("before-update")

			while (@updateCatchup >= @updateTime)
				@fire("update")
				@updateCatchup -= @updateTime

			@fire("after-update")

		delta = Date.now() - @lastTime
		@updateCatchup += delta
		@lastTime += delta
		@interpolation = Math.min(1.0, delta / @updateTime)
		@fire("render", [@interpolation])
