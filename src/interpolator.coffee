import EventManager from "./events/event-manager.js";

export default class Interpolator
	interpolation: 0.0
	lockFPS: false

	constructor: (@renderRate, @updateRate) ->
		@lastTime = Date.now()
		@updateTime = 1000.0 / @updateRate
		@renderTime = 1000.0 / @renderRate
		@updateCatchup = @updateTime
		@maxUpdateCatchup = @updateTime * 3

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

	setMaxUpdateCatchup: (maxUpdateCatchup) ->
		@maxUpdateCatchup = maxUpdateCatchup

	update: =>
		if (@updateCatchup >= @updateTime)
			@fire("before-update")

			t = 0
			while (@updateCatchup >= @updateTime && t < 7)
				@fire("update")
				@updateCatchup -= @updateTime
				t++

			@fire("after-update")

		delta = Date.now() - @lastTime
		@updateCatchup += Math.min(delta, @maxUpdateCatchup)
		@lastTime += delta
		@interpolation = Math.min(1.0, delta / @updateTime)
		@fire("render", [@interpolation])
