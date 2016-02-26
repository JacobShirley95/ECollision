Widget = require("./widget")
Particle = require('../objects/particle')
EventManager = require("../events/event-manager")

module.exports = class Simulation extends Widget
    selected = null

    constructor: (canvasName, @engine, @settings) ->
        super(canvasName)
        @engine.width = @width
        @engine.height = @height
        EventManager.eventify(@)

    resize: (newWidth, newHeight) ->
        @engine.setBounds(newWidth, newHeight)
    
    addParticle: (x, y, mass, radius, style) ->
        particle = new Particle(x, y, radius, style, @settings)
        
        particle.mass = mass

        particle.addListener("click", (ev, particle) =>
            if (selected != null)
                selected.deselect()
                @fire("deselect", [selected])
            
            if (particle != selected)
                @fire("select", [particle])
                selected = particle
                particle.select()
            else 
                selected = null
        )
                
        @stage.addChild(particle.displayObj)
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
        for particle in @engine.particles
            newX = particle.x
            newY = particle.y
    
            if (@settings.global.enableInterpolation) 
                diffX = particle.x - particle.lastX
                diffY = particle.y - particle.lastY
    
                newX = particle.lastX + (interpolation * diffX)
                newY = particle.lastY + (interpolation * diffY)
     
            particle.draw(newX, newY)

        @stage.update()
        @fire("draw")