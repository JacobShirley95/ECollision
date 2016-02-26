EventManager = require("../events/event-manager")

module.exports = class PhysicsObject
    xVel:0
    yVel:0

    constructor: (@x, @y, @mass) ->
        @lastX = @x
        @lastY = @y

        @displayObj = new createjs.Shape()
        @displayObj.x = @x
        @displayObj.y = @y
        @displayObj.addEventListener("click", (ev) => 
            @fire("click", [ev, @])
        )

        EventManager.eventify(@)

    capture: ->
        @lastX = @x
        @lastY = @y

    update: ->
        @x += @xVel
        @y += @yVel
    
    getEnergy: -> 
        return 0.5 * @mass * ((@xVel*@xVel) + (@yVel*@yVel))
    
    draw: (x, y) ->
        @displayObj.x = x
        @displayObj.y = y