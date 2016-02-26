SimulationEngine = require("./engine/simulation-engine")
Simulation = require("./ui/simulation")
Graph = require("./ui/graph")
Overlay = require("./ui/overlay")
ECollisionSettings = require("./settings")
EventManager = require("./events/event-manager")

class ECollision
    widgets = []

    fpsCount = fps = fpsTime = newTime = timeStamp = curTime = 0

    interpolation = 0.0

    thread = -1

    updateRate = updateTime = refreshTime = 0

    constructor: (@settings) ->
        @engine = new SimulationEngine(@settings.simulation.simulationWidth, @settings.simulation.simulationHeight, @settings)

        @simulationUI = new Simulation(@settings.simulation.simulationCanvas, @engine, @settings)
        @graphUI = new Graph(@settings.graph.graphCanvas, @engine, 1/50, 5, @settings)
        @overlayUI = new Overlay(@settings.overlay.overlayCanvas, @simulationUI, @settings)

        @paused = false

        @fps = 0

        widgets = [@simulationUI, @graphUI, @overlayUI]

        updateRate = @settings.global.updateRate
        updateTime = 1000.0 / updateRate

        refreshTime = 1000 / @settings.global.refreshRate

        EventManager.eventify(@)

    start: ->
        for widget in widgets
            widget.init()
        
        thread = setInterval(@tick, 1000.0 / @settings.global.refreshRate)

    restart: ->
        for widget in widgets
            widget.restart()

    resume: ->
        @paused = false
        
        for widget in widgets
            widget.resume()

    pause: ->
        @paused = true

        for widget in widgets
            widget.pause()

    stop: ->
        if (thread != -1)
            clearInterval(thread)

            thread = -1

    getUpdateRate: ->
        return updateRate
    
    getUpdateTime: ->
        return updateTime
    
    setUpdateRate = (rate) ->
        updateRate = rate
        updateTime = 1000.0 / updateRate

    setSpeedConst = (speedConst) ->
        @engine.speedConst = speedConst
    
    update: ->
        curTime += refreshTime
    
        if (newTime + updateTime < curTime)
            timeStamp = curTime
            if (@settings.global.enableInterpolation)
                for particle in @engine.particles
                   particle.capture()
                
            
            while (newTime + updateTime < curTime)
                @engine.update()
                
                newTime += updateTime
        
        interpolation = Math.min(1.0, (curTime - timeStamp) / updateTime)
    
    tick: =>
        if (!@paused)
            @update()

        fpsCurTime = new Date().getTime()
        fpsCount++

        if (fpsCurTime - fpsTime >= 1000)
            @fps = fpsCount

            fpsCount = 0
            fpsTime = fpsCurTime

        for widget in widgets
            widget.draw(interpolation)

        @fire('tick', [interpolation])

module.exports.ECollision = ECollision
module.exports.ECollisionSettings = ECollisionSettings
module.exports.SimulationEngine = SimulationEngine