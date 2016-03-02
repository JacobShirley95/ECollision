EventManager = require("./events/event-manager")

module.exports = class Interpolator
	rate1 = 0
	rate2 = 0

	curTime = lastTime = timeStamp = 0

	interpolation: 0.0
	lockFPS: false

	constructor: (@renderRate, @updateRate, @engine) ->
		@start = new Date().getTime()
		EventManager.eventify(@)

	update: ->
		updateTime = 1000.0 / @updateRate
		renderTime = 1000.0 / @renderRate

		if (@lockFPS)
			curTime = new Date().getTime() - @start
		else
			curTime += renderTime

		if (curTime - lastTime >= updateTime)
			@fire("before-update")
			timeStamp = curTime

			while (curTime - lastTime >= updateTime)
				@engine.update()
				@fire("update")
				lastTime += updateTime

			@fire("after-update")

		@interpolation = Math.min(1.0, (curTime - timeStamp) / updateTime)

		





