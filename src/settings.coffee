module.exports = class ECollisionSettings
	constructor: ->
	global:
		refreshRate: 60
		updateRate: 60
		showVelocities: false
		enableInterpolation: true
		maxTraceLength: 30
		speedConst: 1.0
		maxParticles: 20
		minRadius: 5
		maxRadius: 30
		errorTime: 5000

	simulation:
		simulationWidth: 1000
		simulationHeight: 1000
		simulationCanvas: "simulation-canvas"

	graph:
		graphCanvas: "graph-canvas"
		graphScaleX: 1/50
		graphScaleY: 5
		graphZoomFactor: 1.25
		graphMinZoomIndex: 5
		graphMaxZoomIndex: 5

	overlay:
		overlayCanvas: "overlay-canvas"