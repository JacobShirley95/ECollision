ParticleRenderer = require('./particle-renderer')
SimulationRenderer = require('../simulation-renderer')

module.exports = class EaselJSRenderer extends SimulationRenderer
	renderObjs = []

	constructor: (@canvasName, @engine) ->
		super(@canvasName, @engine)
		@stage = new createjs.Stage(@canvasName)

		@engine.addListener("update", () ->
			for particle in renderObjs
            	particle.capture()
		)

	addParticle: (particle) ->
		pr = new ParticleRenderer(particle)

		@stage.addChild(pr.displayObj)
		renderObjs.push(pr)

	removeParticle: (particle) ->

	draw: (interpolation) ->
		for particle in renderObjs
            particle.draw(interpolation)

		@stage.update()