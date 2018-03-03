export default class PVector
    constructor: (@x, @y) ->

    getMagnitude: ->
        return Math.sqrt((@x * @x) + (@y * @y))

    getMagnitudeNS: ->
        return (@x * @x) + (@y * @y)

    dotProduct: (vec) ->
        return (@x * vec.x) + (@y * vec.y)

    getNormal: ->
        return new PVector(-@y, @x)

    rotate: (angle) ->
        x2 = @x
        y2 = @y

        @x = x2 * Math.cos(angle) - y2 * Math.sin(angle)
        @y = x2 * Math.sin(angle) + y2 * Math.cos(angle)
