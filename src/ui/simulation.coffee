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
        
        engine = @engine
        t = this
        particle.addEventHandler("click", (ev) ->
            p = engine.getParticle(selected)

            if (selected != -1) 
                p.deselect()
                t.onDeselect(p)
                
            for i in [0..@engine.numOfParticles()]
                p = engine.getParticle(i)
                if (p.displayObj == ev.target) 
                    if (i != selected) 
                        t.onSelect(p)
                        selected = i
                        p.selected = true
                     else 
                        selected = -1
                    
                    break
        )
                
        @stage.addChild(particle.displayObj)
        @engine.particles.push(particle)
        
        return particle
    
    
    @onSelect: (particle) ->
        
    
    
    @onDeselect: (particle) ->
        
    
    
    @removeParticle: (index) ->
        @stage.removeChild(@engine.getParticle(index).displayObj)
        @engine.removeParticle(index)
    

    @loadParticles: (toBeLoaded) ->
        @restart()

        for i in [0..@engine.numOfParticles()]
            obj = toBeLoaded[i]
            particle = @addParticle(obj.x, obj.y, obj.mass, obj.radius, obj.style)

            particle.xVel = obj.xVel
            particle.yVel = obj.yVel
            particle.cOR = obj.cOR

    @saveParticles: (saved) ->
        for i in [0..engine.numOfParticles()]
            obj = @engine.getParticle(i)
    
            saved.push(obj.copy())

    @removeSelected: ->
        if (selected != -1) 
            @removeParticle(selected)
            selected = -1

    @getSelected: ->
        sel = null

        if (selected != -1) 
            sel = @engine.getParticle(selected)
        
        return sel

    @getSelectedID: ->
        return selected
    
    @restart: ->
        @stage.removeAllChildren()
        selected = -1
        @engine.reset()
    
    @draw: (interpolation) ->
        for i in [0..@engine.numOfParticles()]
            obj = @engine.getParticle(i)

            newX = obj.x
            newY = obj.y
    
            if (@settings.global.enableInterpolation) 
                diffX = obj.x - obj.lastX
                diffY = obj.y - obj.lastY
    
                newX = obj.lastX + (interpolation * diffX)
                newY = obj.lastY + (interpolation * diffY)
            
     
            obj.draw(newX, newY)

        @stage.update()