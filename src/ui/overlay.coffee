import Widget from "./widget";
import Particle from "../objects/particle";
import EaselJSRenderer from "./renderer/easeljs/easeljs-renderer";

gcd = (a, b) ->
    if (!b)
        return a

    return gcd(b, a % b)

export default class Overlay extends Widget
    @INDEX_PLACE: 0
    @INDEX_VELOCITY: 1
    @INDEX_MODIFY: 2

    @MODE_ADD: 0
    @MODE_EDIT: 1

    errorTimer: 0
    showError: false

    tempObject: null

    constructor: (canvasName, @simulation, @interpol, @settings) ->
        super(canvasName)

        @modeText = new createjs.Text("", "bold 15px Arial")
        @modeText.x = 0
        @modeText.y = 10

        @velocityLine = new createjs.Shape()
        @velText = new createjs.Text("", "bold 15px Arial")
        @errorText = new createjs.Text("", "bold 15px Arial", "red")

        @mouseX = @crossX = @width/2
        @mouseY = @crossY = @height/2

        @mode = -1
        @index = 0

        @modeText.x = (@width/2)-40

        @interval = gcd(@width, @height)

        @hide()

        $(document).keydown((event) =>
            @freePlace = event.ctrlKey
            @copyPlace = event.shiftKey
        )

        $(document).keyup((event) =>
            @freePlace = false
            @copyPlace = false
        )

        @canvas.bind('contextmenu', (e) ->
            return false
        )

        @mouseX = @crossX = @width/2
        @mouseY = @crossY = @height/2

        @stage.addEventListener("stagemousemove", @handleMouseMove)

        @canvas.mousedown(@handleClick)
        @canvas.mousewheel(@handleMouseWheel)

        @renderer = new EaselJSRenderer(canvasName, @interpol, @Settings)

    resize: (width, height) ->
        @interval = gcd(@width, @height)

    init: ->
        @stage.removeAllChildren()

        @simulation.renderer.removeParticle(@tempObject)

        @mouseX = @crossX = @width/2
        @mouseY = @crossY = @height/2

        @stage.addChild(@modeText)

    handleMouseWheel: (ev) =>
        d = ev.deltaY
        if (d < 0)
            if (@tempObject.radius > @settings.global.minRadius)
                @tempObject.radius -= 1

         else
            if (@tempObject.radius < @settings.global.maxRadius)
                @tempObject.radius += 1

    handleMouseMove: (ev) =>
        @mouseX = @crossX = ev.stageX
        @mouseY = @crossY = ev.stageY

        if (!@freePlace)
            gridX = Math.round(@mouseX/@interval)
            gridY = Math.round(@mouseY/@interval)

            @crossX = gridX*@interval
            @crossY = gridY*@interval

        switch (@index)
            when Overlay.INDEX_PLACE
                @velocityLine.x = @crossX
                @velocityLine.y = @crossY

                if (@tempObject != null)
                    @tempObject.x = @crossX
                    @tempObject.y = @crossY

                @velText.x = @crossX
                @velText.y = @crossY

                break
            when Overlay.INDEX_VELOCITY
                g = @velocityLine.graphics

                dx = @crossX-@velocityLine.x
                dy = @crossY-@velocityLine.y

                @velText.x = @velocityLine.x + (dx/2)
                @velText.y = @velocityLine.y + (dy/2)
                @velText.text = Math.round(Math.sqrt(dx*dx + dy*dy)) + " px/s"

                @tempObject.xVel = dx/@settings.global.updateRate
                @tempObject.yVel = dy/@settings.global.updateRate

                g.clear().beginStroke("red").setStrokeStyle(3).moveTo(0, 0).lineTo(dx, dy)

                break

     handleClick: (ev) =>
        if (ev.button == 2 && @index != Overlay.INDEX_MODIFY)
            switch (@index)
                when Overlay.INDEX_PLACE
                    @end()
                    break

                when Overlay.INDEX_VELOCITY
                    break

            @reset()
        else
            switch(@index)
                when Overlay.INDEX_PLACE
                    @velocityLine.graphics.clear()

                    @stage.addChild(@velocityLine)
                    @stage.addChild(@velText)

                    @index = Overlay.INDEX_VELOCITY

                    break
                when Overlay.INDEX_VELOCITY
                    p = @simulation.addParticle(@tempObject.x, @tempObject.y, @tempObject.mass, @tempObject.radius, @tempObject.style)

                    p.xVel = @tempObject.xVel
                    p.yVel = @tempObject.yVel
                    p.cOR = @tempObject.cOR

                    @stage.removeChild(@velocityLine)
                    @stage.removeChild(@velText)

                    @tempObject.xVel = @tempObject.yVel = 0

                    if (@mode == Overlay.MODE_EDIT && !@copyPlace)
                        @index = Overlay.INDEX_MODIFY
                        @simulation.renderer.removeParticle(@tempObject)
                    else
                        @index = Overlay.INDEX_PLACE

                    break
                when Overlay.INDEX_MODIFY
                    possibles = @simulation.renderer.getParticlesAtPos(@mouseX, @mouseY)
                    if (possibles.length > 0)
                        selected = possibles[0].particle

                        @simulation.removeParticle(selected)
                        if (ev.button != 2)
                            @tempObject = selected.copy()

                            @particleRenderer = @simulation.renderer.addParticle(@tempObject)

                            if (!@copyPlace)
                                @simulation.removeSelected()

                            @index = Overlay.INDEX_PLACE

                    break

        ev.stopPropagation()

    draw: (interpolation) ->
        if (!@hidden)
            if (@index == Overlay.INDEX_MODIFY)
                for p in @simulation.renderer.getParticles()
                    if (@simulation.renderer.isParticleAtPos(p, @mouseX, @mouseY))
                        p.select()
                    else
                        p.deselect()

            if (@showError)
                @errorTimer -= 1000/@settings.global.updateRate
                if (@errorTimer <= 0)
                    @showError = false

                    @stage.removeChild(@errorText)

            @stage.update()

     reset: ->
        @stage.removeChild(@velocityLine)
        @stage.removeChild(@velText)
        @index = Overlay.INDEX_PLACE

    beginAdd: (mass, cOR, style) ->
        @show()
        @init()

        @tempObject = new Particle(@crossX, @crossY, 25, style, @settings)
        @tempObject.mass = mass
        @tempObject.cOR = cOR

        @particleRenderer = @simulation.renderer.addParticle(@tempObject)
        #@stage.addChild(@particleRenderer.displayObj);

        @velText.x = @mouseX
        @velText.y = @mouseY

        @modeText.text = "Mode: Add"

        @index = Overlay.INDEX_PLACE
        @mode = Overlay.MODE_ADD

    beginEdit: ->
        @show()
        @init()

        @modeText.text = "Mode: Edit"

        @index = Overlay.INDEX_MODIFY
        @mode = Overlay.MODE_EDIT

    end: ->
        @hide()

        @simulation.renderer.removeParticle(@tempObject)

        @tempObject = null

        @mode = -1

        @freePlace = false
        @copyPlace = false

    getCurrentParticle: ->
        return @tempObject

    getMode: ->
        return @mode
