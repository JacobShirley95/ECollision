ParticleRenderer = require('./particle-renderer')
SimulationRenderer = require('../simulation-renderer')

module.exports = class EaselJSRenderer extends SimulationRenderer
	renderObjs = []

	constructor: (@canvasName, @interpolator, @settings) ->
		super(@canvasName, @interpolator)
		@stage = new createjs.Stage(@canvasName)

		console.log(@interpolator)

		@interpolator.addListener("before-update", () ->
			for particle in renderObjs
            	particle.capture()
		)

	addParticle: (particle) ->
		pr = new ParticleRenderer(particle, @settings.simulation.enableSelection)

		@stage.addChild(pr.displayObj)
		renderObjs.push(pr)

	removeParticle: (particle) ->

	draw: (interpolation) ->
		for particle in renderObjs
            particle.draw(interpolation)

		@stage.update()