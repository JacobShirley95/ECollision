module.exports = class Widget
    hidden:false

    constructor: (@canvasName) ->
        @canvas = $("#"+@canvasName)
        @width = @canvas.width()
        @height = @canvas.height()

        @stage = new createjs.Stage(@canvasName)

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
        @width = newWidth;
        @height = newHeight;
    
    show: -> 
        @hidden = false
        @canvas.fadeIn(200)
    
    hide: -> 
        @hidden = true
        @canvas.fadeOut(200)
