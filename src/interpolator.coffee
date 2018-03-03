import EventManager from "./events/event-manager";

export default class Interpolator
	interpolation: 0.0
	lockFPS: false

	constructor: (@renderRate, @updateRate) ->
		@startTime = new Date().getTime()
		@updateTime = 1000.0 / @updateRate
		@renderTime = 1000.0 / @renderRate

		@curTime = @lastTime = @timeStamp = 0
		@thread = 0

		EventManager.eventify(@)

	start: ->
		@thread = setInterval(@update, @updateTime)

	@interpolate: (startVal, endVal, fraction) ->
		return startVal + (fraction*(endVal-startVal))

	update: =>
		if (@lockFPS)
			@curTime = new Date().getTime() - @startTime
		else
			@curTime += @renderTime

		if (@curTime - @lastTime >= @updateTime)
			@fire("before-update")
			@timeStamp = @curTime

			while (@curTime - @lastTime >= @updateTime)
				@fire("update")
				@lastTime += @updateTime

			@fire("after-update")

		@interpolation = Math.min(1.0, (@curTime - @timeStamp) / @updateTime)
		@fire("render", [@interpolation])
