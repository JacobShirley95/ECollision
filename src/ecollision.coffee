SimulationEngine = require("./engine/simulation-engine")
Simulation = require("./ui/simulation")
Graph = require("./ui/graph")
Overlay = require("./ui/overlay")
ECollisionSettings = require("./settings")
EventManager = require("./events/event-manager")
Interpolator = require("./interpolator")

module.exports = class ECollision
    widgets = []

    fpsCount = fps = fpsTime = newTime = timeStamp = curTime = 0

    interpolation = 0.0

    thread = -1

    updateRate = updateTime = refreshTime = 0

    constructor: (@settings) ->
        @engine = new SimulationEngine(@settings.simulation.simulationWidth, @settings.simulation.simulationHeight, @settings)

        @interpol = new Interpolator(@settings.global.refreshRate, @settings.global.updateRate, @engine)
        @interpol.lockFPS = true

        @simulationUI = new Simulation(@settings.simulation.simulationCanvas, @engine, @interpol, @settings)
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
        @interpol.update()

        interpolation = @interpol.interpolation
    
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