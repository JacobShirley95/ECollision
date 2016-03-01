Widget = require("./widget")
Particle = require('../objects/particle')
EventManager = require("../events/event-manager")
EaselJSRenderer = require("./renderer/easeljs/easeljs-renderer")

module.exports = class Simulation extends Widget
    selected = null

    constructor: (canvasName, @engine, @settings) ->
        super(canvasName)
        @engine.width = @width
        @engine.height = @height

        @renderer = new EaselJSRenderer(@canvasName, @engine)

        EventManager.eventify(@)

    resize: (newWidth, newHeight) ->
        @engine.setBounds(newWidth, newHeight)
    
    addParticle: (x, y, mass, radius, style) ->
        particle = new Particle(x, y, radius, style, @settings)
        particle.mass = mass

        console.log(@renderer)

        @renderer.addParticle(particle)

        particle.addListener("select", (ev, particle) =>
            @selected = particle
        ).addListener("deselect", (ev, particle) =>
            @selected = null
        )

        @engine.particles.push(particle)
        
        return particle
    
    removeParticle: (index) ->
        @stage.removeChild(@engine.particles[index].displayObj)
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
        if (selected != null)
            for particle,i in @particles
                if (particle == selected)
                    @removeParticle(i)

            selected = null

    getSelected: ->
        return selected
    
    restart: ->
        @stage.removeAllChildren()
        selected = null
        @engine.reset()
        @fire("restart")
    
    draw: (interpolation) ->
        ###for particle in @engine.particles
            newX = particle.x
            newY = particle.y
    
            if (@settings.global.enableInterpolation) 
                diffX = particle.x - particle.lastX
                diffY = particle.y - particle.lastY
    
                newX = particle.lastX + (interpolation * diffX)
                newY = particle.lastY + (interpolation * diffY)
     
            particle.draw(newX, newY)

        @stage.update()

        ###

        @renderer.draw(interpolation)

        @fire("draw")