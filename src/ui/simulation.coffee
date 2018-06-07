import Widget from "./widget.js";
import Particle from "../objects/particle.js";
import EventManager from "../events/event-manager.js";
import EaselJSRenderer from "./renderer/easeljs/easeljs-renderer.js";

export default class Simulation extends Widget
    selected: null

    constructor: (canvasName, @engine, @interpolator, @settings) ->
        super(canvasName)

        @engine.width = @width
        @engine.height = @height

        @renderer = new EaselJSRenderer(@stage, @interpolator, @settings)

        EventManager.eventify(@)

    resize: (newWidth, newHeight) ->
        super(newWidth, newHeight)
        @engine.setBounds(@width, @height)

    addParticle: (x, y, mass, radius, style) ->
        particle = new Particle(x, y, radius, style, @settings)
        particle.mass = mass

        result = @renderer.addParticle(particle)

        result.addListener("select", (ev, particle) =>
            @fire("particle-selected", [particle.particle])
            if (@selected != null)
                @selected.renderer.deselect()

            @selected = particle.particle
        ).addListener("deselect", (ev, particle) =>

            @selected = null
            @fire("particle-deselected", [particle.particle])
        )

        @engine.particles.push(particle)

        return particle

    removeParticle: (index) ->
        if (typeof index == "object")
            @renderer.removeParticle(index)

            for p,i in @engine.particles
                if (p == index)
                    @engine.particles.splice(i, 1)
                    break
        else
            @renderer.removeParticle(@engine.particles[index])
            @engine.particles.splice(index, 1)

    loadParticles: (toBeLoaded) ->
        @restart()

        for obj in toBeLoaded
            particle = @addParticle(obj.x, obj.y, obj.mass, obj.radius, obj.style)

            particle.xVel = obj.xVel
            particle.yVel = obj.yVel
            particle.cOR = obj.cOR

    saveParticles: (saved) ->
        for particle in @engine.particles
            saved.push(particle.copy())

    removeSelected: ->
        if (@selected != null)
            for particle,i in @particles
                if (particle == @selected)
                    @removeParticle(i)

            @selected = null

    getSelected: ->
        return @selected

    restart: ->
        @renderer.clear()
        @selected = null
        @engine.reset()

        @fire("restart")

    draw: (interpolation) ->
        @renderer.draw(interpolation)

        @fire("draw")
