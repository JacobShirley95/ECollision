module.exports = class PhysicsObject
    xVel:0
    yVel:0
    constructor: (@x, @y, @mass) ->
        @lastX = @x
        @lastY = @y
        @displayObj = new createjs.Shape()
        @displayObj.x = @x
        @displayObj.y = @y

    capture: ->
        @lastX = @x
        @lastY = @y

    update: ->
        @x += @xVel
        @y += @yVel

    addEventHandler: (event, handler) ->
        @displayObj.addEventListener(event, handler)
    
    getEnergy: -> 
        return 0.5 * @mass * ((@xVel*@xVel) + (@yVel*@yVel))
    
    draw: (x, y) ->
        @displayObj.x = x
        @displayObj.y = y