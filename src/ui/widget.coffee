export default class Widget
    constructor: (@canvasName) ->
        @canvas = $("#"+@canvasName)

        @hidden = false

        @stage = new createjs.Stage(@canvasName)

        @width = @canvas.width()
        @height = @canvas.height()
        
        @canvas.attr("width", @width)
        @canvas.attr("height", @height)

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

    show: ->
        @hidden = false
        @canvas.fadeIn(200)

    hide: ->
        @hidden = true
        @canvas.fadeOut(200)
