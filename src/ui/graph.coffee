import Widget from "./widget.js";
import Particle from "../objects/particle.js";
import Point2D from "../math/point-2d.js";

export default class Graph extends Widget
    x: 0
    y: 0
    scaleX: 0
    scaleY: 0

    graph: new createjs.Shape()

    offsetX: 0.0
    offsetY: 0.0

    userY: 0

    data: []
    start: 0
    maxLen: 150

    updated: false

    currX: 0
    currY: 0

    zoomIndex: 0

    constructor: (canvasName, @engine, @scaleX, @scaleY, @settings) ->
        super(canvasName)

    init: ->
        xAxis = new createjs.Shape()
        yAxis = new createjs.Shape()

        xAxis.graphics.beginStroke("red").moveTo(@x, 0).lineTo(@width, 0)
        xAxis.x = @x
        xAxis.y = @height

        yAxis.graphics.beginStroke("red").moveTo(0, @y).lineTo(0, @height)
        yAxis.x = @x
        yAxis.y = 0

        xAxis.cache(-1, -5, @width, 10)
        yAxis.cache(-5, -1, 10, @height)

        @stage.addChild(xAxis)
        @stage.addChild(yAxis)

        @stage.addChild(@graph)
        @stage.update()

        @updateData()

    draw: (interpolation) ->
        if (@engine != null)
            g = @graph.graphics

            g.clear()

            length = @data.length-1
            total = 0

            j = 0
            while j < length-1
                if (@updated)
                    @updated = false
                    return

                total += @data[j].y

                #calculate offsetted index for point at index j
                i = (@start+j)%length
                i2 = (@start+j+1)%length

                x2 = (@data[i].x*@scaleX)-@offsetX
                y2 = (@data[i].y*@scaleY)+@offsetY+@userY

                #if second x value is larger than width, move graph along
                if (x2 > @width)
                    @offsetX += x2-@width

                x1 = (@data[i].x*@scaleX)-@offsetX
                y1 = (@data[i].y*@scaleY)+@offsetY+@userY

                x3 = (@data[i2].x*@scaleX)-@offsetX
                y3 = (@data[i2].y*@scaleY)+@offsetY+@userY

                g.beginStroke("red").moveTo(@x+x1, @y+@height-y1).lineTo(@x+x3, @y+@height-y3)
                j++

            if (!@paused)
                @currX += 1000/@settings.global.updateRate
                @currY = @getEnergy()

                @addData(@currX, @currY)

            @graph.cache(0, 0, @width, @height)

            @dataY = total/@data.length
            targetY = @height/2

            @offsetY = targetY-(@dataY*@scaleY)

            @stage.update()

    restart: ->
        @data = []
        @start = 0
        @currX = @currY = 0
        @offsetX = @offsetY = 0
        @updated = true

    calibrate: ->
        @userY = 0

    zoomIn: ->
        if (@zoomIndex < @settings.graph.graphMaxZoomIndex)
            @scaleX *= @settings.graph.graphZoomFactor
            @scaleY *= @settings.graph.graphZoomFactor

            @offsetX *= @scaleX
            @offsetY *= @scaleY

            @updateData()

            @zoomIndex++
        else throw("ERROR: Maximum zoom reached")

    zoomOut: ->
        if (@zoomIndex > -@settings.graph.graphMinZoomIndex)
            @scaleX /= @settings.graph.graphZoomFactor
            @scaleY /= @settings.graph.graphZoomFactor

            @offsetX *= @scaleX
            @offsetY *= @scaleY

            @updateData()

            @zoomIndex--
        else throw("ERROR: Minimum zoom reached")

    moveUp: ->
        @userY -= 5

    moveDown: ->
        @userY += 5

    getZoomIndex: ->
        return @zoomIndex

    addData: (x, y) ->
        if (@data.length > @maxLen)
            s = @start

            @start = (@start + 1)%@maxLen

            @data[s] = new Point2D(x, y)
        else
            @data.push(new Point2D(x, y))

    updateData: ->
        @data2 = []

        @maxLen = Math.round(@width/((1000/@settings.global.updateRate)*@scaleX))+5

        aLen = @data.length-1
        diff = 0

        if (aLen > @maxLen)
            diff = aLen-@maxLen

        for j in [diff..aLen-1] by 1
            i = (@start+j)%aLen
            @data2.push(@data[i])

        @updated = true
        @start = 0

        @data = @data2

    getEnergy: ->
        energy = 0.0

        for particle in @engine.particles
            energy += particle.getEnergy()

        return Math.round(energy/1000)
