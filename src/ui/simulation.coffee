Widget = require("./widget")
Particle = require('../objects/particle')

module.exports = class Simulation extends Widget
    selected = -1

    constructor: (canvasName, @engine, @settings) ->
        super(canvasName)
        @engine.width = @width
        @engine.height = @height;

    resize: (newWidth, newHeight) ->
        @engine.setBounds(newWidth, newHeight)
    
    
    addParticle: (x, y, mass, radius, style) ->
        particle = new Particle(x, y, radius, style, @settings)
        
        particle.mass = mass

        particle.addEventListener("click", (ev) =>
            if (selected != -1)
                p = @engine.particles[selected]
                p.deselect()
                @onDeselect(p)
                
            i = 0
            while i < @engine.particles.length
                p = @engine.particles[i]
                if (p.displayObj == ev.target) 
                    if (i != selected) 
                        @onSelect(p)
                        selected = i
                        p.select()
                     else 
                        selected = -1
                    
                    break
                i++
        )
                
        @stage.addChild(particle.displayObj)
        @engine.particles.push(particle)
        
        return particle
    
    
    onSelect: (particle) ->
        
    
    
    onDeselect: (particle) ->
        
    
    
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
        if (selected != -1) 
            @removeParticle(selected)
            selected = -1

    getSelected: ->
        sel = null

        if (selected != -1) 
            sel = @engine.particles[selected]
        
        return sel

    getSelectedID: ->
        return selected
    
    restart: ->
        @stage.removeAllChildren()
        selected = -1
        @engine.reset()
    
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