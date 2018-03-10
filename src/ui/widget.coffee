rgb2hex = (rgb) ->
    if (  rgb.search("rgb") == -1 )
        return rgb
    else
        rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/)
        hex = (x) ->
            return ("0" + parseInt(x).toString(16)).slice(-2)

        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3])

export default class Widget
    constructor: (@canvasName) ->
        @canvas = $("#"+@canvasName)

        @hidden = false

        @width = @canvas.width()
        @height = @canvas.height()

        @canvas.attr("width", @width)
        @canvas.attr("height", @height)

        @stage = new createjs.StageGL(@canvasName)
        @stage.setClearColor(rgb2hex(@canvas.css("background-color")));

    init: ->

    addEventListener: (event, handler) ->
        @stage.addEventListener(event, handler)

    draw: (interpolation) ->

    restart: ->

    stop: ->

    resume: ->
        @paused = false

    pause: ->
        @paused = true

    resize: (newWidth, newHeight) ->
        if (typeof newWidth == "undefined")
            @width = @canvas.width()
            @height = @canvas.height()
        else
            @width = newWidth
            @height = newHeight

        @canvas.attr("width", @width)
        @canvas.attr("height", @height)

        @stage.updateViewport(@width, @height)

    show: ->
        @hidden = false
        @canvas.fadeIn(200)

    hide: ->
        @hidden = true
        @canvas.fadeOut(200)
