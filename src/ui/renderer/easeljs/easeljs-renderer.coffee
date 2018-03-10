import ParticleRenderer from "./particle-renderer.js";
import SimulationRenderer from "../simulation-renderer.js";

export default class EaselJSRenderer extends SimulationRenderer
	constructor: (@stage, interpolator, @settings) ->
		super(interpolator)

		@renderObjs = []

		@interpolator.addListener("before-update", () =>
			for particle in @renderObjs
				particle.capture()
		)

	addParticle: (particle) ->
		pr = new ParticleRenderer(particle, @settings.simulation.enableSelection)
		particle.renderer = pr

		@stage.addChild(pr.displayObj)

		@renderObjs.push(pr)

		return pr

	getParticlesAtPos: (x, y) ->
		list = []
		for renderable in @renderObjs
			if (@isParticleAtPos(renderable, x, y))
				list.push(renderable)

		return list

	isParticleAtPos: (particle, x, y) ->
		p = particle.particle

		dx = p.x-x
		dy = p.y-y

		if (dx*dx + dy*dy <= p.radius*p.radius)
			return true

		return false

	removeParticles: (particles) ->
		#todo

	removeParticle: (particle) ->
		#console.log("removing particle")
		for p,i in @renderObjs
			if (particle == p.particle)
				particle.renderer = null

				@stage.removeChild(p.displayObj)
				@renderObjs.splice(i, 1)
				break

	getParticles: ->
		return @renderObjs

	clear: ->
		for p in @renderObjs
			@stage.removeChild(p.displayObj)
			p.particle = null

		@renderObjs = []

	draw: (interpolation) ->
		for particle in @renderObjs
			particle.draw(interpolation)

		@stage.update()
