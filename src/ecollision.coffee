import SimulationEngine from "./engine/simulation-engine.js";
import Simulation from "./ui/simulation.js";
import Graph from "./ui/graph.js";
import Overlay from "./ui/overlay.js"
import ECollisionSettings from "./settings.js";
import EventManager from "./events/event-manager.js";
import Interpolator from "./interpolator.js";

export default class ECollision
    constructor: (@settings) ->
        @engine = new SimulationEngine(@settings.simulation.simulationWidth, @settings.simulation.simulationHeight, @settings)

        @interpol = new Interpolator(@settings.global.refreshRate, @settings.global.updateRate)
        @interpol.lockFPS = true

        @widgets = []

        if (@settings.simulation.simulationCanvas)
            @simulationUI = new Simulation(@settings.simulation.simulationCanvas, @engine, @interpol, @settings)
            @widgets.push(@simulationUI)

        if (@settings.graph)
            @graphUI = new Graph(@settings.graph.graphCanvas, @engine, 1/50, 5, @settings)
            @widgets.push(@graphUI)

        if (@settings.overlay)
            @overlayUI = new Overlay(@settings.overlay.overlayCanvas, @simulationUI, @interpol, @settings)
            @widgets.push(@overlayUI)

        @paused = false

        @fpsCount = @fps = @fpsTime = 0
        @updateRate = @updateTime = @refreshTime = 0

        @interpol.addListener("update", () =>
            if (!@paused)
                @update()
        ).addListener("render", @tick)

        @updateRate = @settings.global.updateRate
        @updateTime = 1000.0 / @updateRate
        @refreshTime = 1000 / @settings.global.refreshRate

        EventManager.eventify(@)

    start: ->
        for widget in @widgets
            widget.init()

        @interpol.start()

    restart: ->
        for widget in @widgets
            widget.restart()

    resume: ->
        @paused = false

        for widget in @widgets
            widget.resume()

    pause: ->
        @paused = true

        for widget in @widgets
            widget.pause()

    stop: ->
        @interpol.stop()

    getUpdateRate: ->
        return @updateRate

    getUpdateTime: ->
        return @updateTime

    setUpdateRate = (rate) ->
        @updateRate = rate
        @updateTime = 1000.0 / @updateRate

    setSpeedConst = (speedConst) ->
        @engine.speedConst = speedConst

    resize: ->
        for widget in @widgets
            widget.resize()

    update: ->
        @engine.update()

    tick: (interpolation) =>
        @fpsCurTime = Date.now();
        @fpsCount++

        if (@fpsCurTime - @fpsTime >= 1000)
            @fps = @fpsCount

            @fpsCount = 0
            @fpsTime = @fpsCurTime

        for widget in @widgets
            widget.draw(interpolation)

        @fire('tick', [interpolation])
