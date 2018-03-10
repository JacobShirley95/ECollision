import PhysicsObject from "./physics-object.js";
import Point2D from "../math/point-2d.js";

export default class Particle extends PhysicsObject
    cOR: 1.0
    renderer: null

    constructor: (x, y, @radius, @style, @settings) ->
        super(x, y, 0)
        @needsUpdate = false

    update: ->
        @x += @xVel*@settings.global.speedConst
        @y += @yVel*@settings.global.speedConst

    copy: ->
       p = new Particle(@x, @y, @radius, @style, @settings)

       p.index = @index
       p.cOR = @cOR
       p.mass = @mass
       p.xVel = @xVel
       p.yVel = @yVel

       return p
