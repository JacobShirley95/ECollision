PhysicsObject = require('./physics-object')
Point2D = require('../math/point-2d')

module.exports = class Particle extends PhysicsObject
    selected: false
    cOR: 1.0
    pastPositions: []
    curPos:0

    constructor: (x, y, @radius, @style, @settings) ->
        super(x, y, 0)

    update: ->
        @x += @xVel*@settings.global.speedConst
        @y += @yVel*@settings.global.speedConst
        
    copy: ->
       p = new Particle(@x, @y, @radius, @style, @settings)

       p.index = @index
       p.cOR = @cOR
       p.mass = @mass
       p.xVel = @xVel
       p.yVel = @yVel

       return p