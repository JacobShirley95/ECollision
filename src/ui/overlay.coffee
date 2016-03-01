Widget = require("./widget")
Particle = require("../objects/particle")

module.exports = class Overlay extends Widget
    INDEX_PLACE = 0
    INDEX_VELOCITY = 1
    INDEX_MODIFY = 2

    MODE_ADD = 0
    MODE_EDIT = 1

    index = 0

    mode = -1
    
    mouseX = crossX = 0
    mouseY = crossY = 0
    
    velocityLine = new createjs.Shape()
    infoText = new createjs.Text("", "bold 15px Arial")
    errorText = new createjs.Text("", "bold 15px Arial", "red")
    errorTimer = 0
    showError = false

    modeText = new createjs.Text("", "bold 15px Arial")
    modeText.x = 0
    modeText.y = 10

    freePlace = false
    copyPlace = false

    lastX = 0
    lastY = 0

    tempObject = null

    interval = 0

    constructor: (canvasName, @simulation, @settings) ->
        super(canvasName)

        mouseX = crossX = @width/2
        mouseY = crossY = @height/2

        modeText.x = (@width/2)-40

        interval = gcd(@width, @height)

        @hide()

        $(document).keydown((event) -> 
            freePlace = event.ctrlKey
            copyPlace = event.shiftKey
        )
        
        $(document).keyup((event) -> 
            freePlace = false
            copyPlace = false
        )
        
        @canvas.bind('contextmenu', (e) ->
            return false
        )

        mouseX = crossX = @width/2
        mouseY = crossY = @height/2

        @stage.addEventListener("stagemousemove", @handleMouseMove)

        @canvas.mousedown(@handleClick)
        @canvas.mousewheel(@handleMouseWheel)

    gcd = (a, b) ->
        if (!b) 
            return a
        
        return gcd(b, a % b)

    resize: (width, height) ->
        interval = gcd(@width, @height)

    init: -> 
        @stage.removeAllChildren()

        mouseX = crossX = @width/2
        mouseY = crossY = @height/2

        @stage.addChild(modeText)

    handleMouseWheel: (ev) => 
        d = ev.deltaY
        if (d < 0) 
            if (tempObject.radius > @settings.global.minRadius) 
                tempObject.radius -= 1
            
         else 
            if (tempObject.radius < @settings.global.maxRadius) 
                tempObject.radius += 1

    handleMouseMove: (ev) => 
        mouseX = crossX = ev.stageX
        mouseY = crossY = ev.stageY
        
        if (!freePlace) 
            gridX = Math.round(mouseX/interval)
            gridY = Math.round(mouseY/interval)
            
            crossX = gridX*interval
            crossY = gridY*interval

        switch (index) 
            when INDEX_PLACE
                velocityLine.x = crossX
                velocityLine.y = crossY
                
                if (tempObject != null) 
                    tempObject.x = crossX
                    tempObject.y = crossY
                
                infoText.x = crossX
                infoText.y = crossY

                break
            when INDEX_VELOCITY
                g = velocityLine.graphics
            
                dx = crossX-velocityLine.x
                dy = crossY-velocityLine.y
                
                infoText.x = velocityLine.x + (dx/2)
                infoText.y = velocityLine.y + (dy/2)
                infoText.text = Math.round(Math.sqrt(dx*dx + dy*dy)) + " px/s"
                
                tempObject.xVel = dx/@settings.global.updateRate
                tempObject.yVel = dy/@settings.global.updateRate
                
                g.clear().beginStroke("red").setStrokeStyle(3).moveTo(0, 0).lineTo(dx, dy)

                break

            when INDEX_MODIFY
                for p in @simulation.engine.particles
                    dx = p.x-mouseX
                    dy = p.y-mouseY
                    if (dx*dx + dy*dy <= p.radius*p.radius) 
                        p.select()
                        
                        tempObject = p
                    else 
                        p.deselect()
                break

     handleClick: (ev) => 
        if (ev.button == 2 && index != INDEX_MODIFY) 
            switch (index) 
                when INDEX_PLACE
                    @end()
                    break

                when INDEX_VELOCITY
                    break
            
            @reset()
        else 
            switch(index) 
                when INDEX_PLACE
                    velocityLine.graphics.clear()
                
                    @stage.addChild(velocityLine)
                    @stage.addChild(infoText)

                    index = INDEX_VELOCITY

                    break
                when INDEX_VELOCITY
                    p = @simulation.addParticle(tempObject.x, tempObject.y, tempObject.mass, tempObject.radius, tempObject.style)
                
                    p.xVel = tempObject.xVel
                    p.yVel = tempObject.yVel
                    p.cOR = tempObject.cOR
                    
                    @stage.removeChild(velocityLine)
                    @stage.removeChild(infoText)

                    tempObject.xVel = tempObject.yVel = 0

                    if (mode == MODE_EDIT && !copyPlace) 
                        index = INDEX_MODIFY
                        @stage.removeChild(tempObject.displayObj)
                    else 
                        index = INDEX_PLACE

                    break
                when INDEX_MODIFY
                    tempObject.displayObj.dispatchEvent("click")
                    if (ev.button == 2) 
                        @simulation.removeSelected()
                    else 
                        selected = tempObject

                        tempObject = selected.copy()

                        lastX = selected.x
                        lastY = selected.y

                        @stage.addChild(tempObject.displayObj)

                        if (!copyPlace)
                            @simulation.removeSelected()

                        index = INDEX_PLACE

                    break
        
        ev.stopPropagation()
    
    draw: (interpolation) ->
        if (!@hidden) 
            if (tempObject != null) 
                tempObject.draw(tempObject.x, tempObject.y)

            if (showError) 
                errorTimer -= 1000/@settings.global.updateRate
                if (errorTimer <= 0) 
                    showError = false

                    @stage.removeChild(errorText)
                
            @stage.update()
    
     reset: ->
        if (mode == MODE_EDIT) 
            p = simulation.addParticle(lastX, lastY, tempObject.mass, tempObject.radius, tempObject.style)

            p.xVel = tempObject.xVel
            p.yVel = tempObject.yVel

            @removeChild(tempObject.displayObj)
            tempObject = null

            index = INDEX_MODIFY
         else 
            @stage.removeChild(velocityLine)
            @stage.removeChild(infoText)
            index = INDEX_PLACE
    
    
    beginAdd: (mass, cOR, style) ->
        @show()
        @init()

        tempObject = new Particle(crossX, crossY, 25, style, @settings)
        tempObject.mass = mass
        tempObject.cOR = cOR
        
        infoText.x = mouseX
        infoText.y = mouseY

        @stage.addChild(tempObject.displayObj)

        modeText.text = "Mode: Add"

        index = INDEX_PLACE
        mode = MODE_ADD
    
    beginEdit: ->
        @show()
        @init()

        modeText.text = "Mode: Edit"

        index = INDEX_MODIFY
        mode = MODE_EDIT

    end: ->
        @hide()
        @stage.removeAllChildren()
        if (tempObject != null) 
            tempObject = null
        
        mode = -1

        freePlace = false
        copyPlace = false

    getCurrentParticle: ->
        return tempObject

    getMode: ->
        return mode