PhysicsObject = require('./physics-object')
Point2D = require('../math/point-2d')

module.exports = class Particle extends PhysicsObject
    selected: false
    cOR: 1.0

    pastPositions = []
    curPos = 0

    constructor: (x, y, @radius, @style, @settings) ->
        super(x, y)
    
    draw: (x, y) ->
        @displayObj.x = x
        @displayObj.y = y
        
        graphics = @displayObj.graphics
        
        graphics.clear()

        if (@selected) 
            len = pastPositions.length
            i = 0
            while i < len
                p = pastPositions[(i + curPos) % len]
                px = p.x-x
                py = p.y-y

                r_a = i / len

                col = "rgba(100, 100, 100, "+r_a+")"
                graphics.beginStroke(col).drawCircle(px, py, @radius).endStroke()
                i++

            graphics.beginStroke("red").setStrokeStyle(3).drawCircle(0, 0, @radius).endStroke()

        graphics.beginFill(@style).drawCircle(0, 0, @radius).endFill()

        if (@selected || @settings.global.showVelocities) 
            graphics.beginStroke("red").setStrokeStyle(3).moveTo(0, 0).lineTo(@xVel*@settings.global.updateRate, @yVel*@settings.global.updateRate).endStroke()

    select: ->
        @selected = true
    
    
    deselect: ->
        @selected = false
        pastPositions = []
    
    
    update: ->
        @x += @xVel*@settings.global.speedConst
        @y += @yVel*@settings.global.speedConst

        len = pastPositions.length
        if (@selected) 
            curPos++
            curPos %= @settings.global.maxTraceLength
            if (len < @settings.global.maxTraceLength) 
                pastPositions.push(new Point2D(@x, @y))
             else 
                pastPositions[curPos] = new Point2D(@x, @y)

    copy: ->
       p = new Particle(@x, @y, @radius, @style, @settings)

       p.index = @index
       p.cOR = @cOR
       p.mass = @mass
       p.xVel = @xVel
       p.yVel = @yVel

       return p