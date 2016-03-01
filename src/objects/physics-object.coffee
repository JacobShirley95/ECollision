EventManager = require("../events/event-manager")

module.exports = class PhysicsObject
    xVel:0
    yVel:0

    constructor: (@x, @y, @mass) ->
        @lastX = @x
        @lastY = @y

        EventManager.eventify(@)

    capture: ->
        @lastX = @x
        @lastY = @y

    update: ->
        @x += @xVel
        @y += @yVel
    
    getEnergy: -> 
        return 0.5 * @mass * ((@xVel*@xVel) + (@yVel*@yVel))