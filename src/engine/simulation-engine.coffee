Particle = require('../objects/particle')
PVector = require('../math/pvector')

module.exports = class SimulationEngine
    particles: []
    
    constructor: (@width, @height, @settings) ->

    setBounds: (@width, @height) ->

    reset: ->
        @particles = []
    
    #Collision class that stores which objects collided and a time constant of how much to seperate them by.
    class Collision
        time: 0.0
        particle: null
        particle2: null

    #his detects if there is an edge collision.
    edgeCollision: (particle, rebound) ->
        cOR = particle.cOR

        #If the particle is outside the width set, it will be placed back inside
        if (particle.x + particle.radius >= @width)
            if (rebound)
                #The particle may lose energy if it's coefficient of restitution is less than 1.
                particle.xVel *= -cOR
                particle.yVel *= cOR
            else 
                particle.x = @width - particle.radius
            
        else if (particle.x - particle.radius <= 0) 
            if (rebound)
                particle.xVel *= -cOR
                particle.yVel *= cOR
            else
                particle.x = particle.radius
        
        #If the particle is outside the height set, it will be placed back inside
        if (particle.y + particle.radius >= @height)
            if (rebound)
                particle.xVel *= cOR
                particle.yVel *= -cOR
            else
                particle.y = @height - particle.radius
            
        else if (particle.y - particle.radius <= 0) 
            if (rebound)
                particle.xVel *= cOR
                particle.yVel *= -cOR
            else
                particle.y = particle.radius
    
    #This functions checks for a collision and returns true or false if yes. It also calculates the required amount of time to seperate the particles.
    collide: (particle, particle2, collision) ->
        #Take the distances between the particles on the x and y axes
        dX = particle2.x - particle.x
        dY = particle2.y - particle.y
        
        #Calculate the square of the distance
        sqr = (dX * dX) + (dY * dY)
        r = particle2.radius + particle.radius
        
        #Could sqrt to get the distance, but there's no need because the otherside would also have to be sqrted
        if (sqr < r * r)
            #Now to get the time constant between the last update and this update at which the particles would have collided perfectly
            #Put into pvectors as we need to get the dot products
            pDiff = new PVector(particle.x - particle2.x, particle.y - particle2.y)
            vDiff = new PVector(particle.xVel - particle2.xVel, particle.yVel - particle2.yVel)
            
            #The following can be derived thus:
            #          At the time of a perfect collision:
            #              let dx = particle2_currentX - particle1_currentX
            #              let dy = particle2_currentY - particle1_currentY
            #
            #              let diffVelocityX = particle2_velocityX-particle1_velocityX
            #              let diffVelocityY = particle2_velocityY-particle1_velocityY
            #
            #              let particle1_xFinal = particle1_currentX - (particle1_velocityX * time)
            #              let particle1_yFinal = particle1_currentY - (particle1_velocityY * time)
            #
            #              let particle2_xFinal = particle2_currentX - (particle2_velocityX * time)
            #              let particle2_yFinal = particle2_currentY - (particle2_velocityY * time)
            #
            #          We need to solve for time:
            #              let diffX = particle2_xFinal-particle1_xFinal
            #              let diffY = particle2_yFinal-particle1_yFinal
            #
            #          Rearranging and subbing-in this gives:
            #              diffX = particle2_currentX - (particle2_velocityX * time) - particle1_currentX - (particle1_velocityX * time) 
            #                    = (particle2_currentX - particle1_currentX) - time*(particle2_velocityX-particle1_velocityX) 
            #                    = dx - time*diffVelocityX
            #
            #              diffY = particle2_currentY - (particle2_velocityY * time) - particle1_currentY - (particle1_velocityY * time) 
            #                    = (particle2_currentY - particle1_currentY) - time*(particle2_velocityY-particle1_velocityY)
            #                    = dy - time*diffVelocityY          
            #
            #          Now it is just like a collision check, as above, except this time we can solve for time:
            #              let sqr = sqr(diffX) + sqr(diffY) 
            #                      = sqr(dx - time*diffVelocityX) + sqr(dy - time*diffVelocityY)
            #
            #          Now to expand the brackets:
            #              sqr = sqr(dx) - 2*time*diffVelocityX*dx + sqr(time)*sqr(diffVelocityX) + sqr(dy) - 2*time*diffVelocityY*dy + sqr(time)*sqr(diffVelocityY)
            #              
            #          We're trying to find time, and or a perfect collision, sqr must equal the sum of the radii squared
            #          So our quadratic equation is:
            #              let radiiSqred = sqr(particle1_radius+particle2_radius)
            #
            #              sqr = a*sqr(time) + b*time + c-radiiSqred = 0
            #              a = sqr(diffVelocityX)+sqr(diffVelocityY) (NOTE: dotProduct as below)
            #              b = -2*(dx*diffVelocityX + diffVelocityY*dy) (NOTE: dotProduct as below)
            #              c = sqr(dx)+sqr(dy) - radiiSqred
            #          
            #          We then use the quadratic formula (-b +- sqrt(b*b - 4*a*c))/(2*a) to calculate time
            a = vDiff.dotProduct(vDiff)
            b = -2 * vDiff.dotProduct(pDiff)
            c = (pDiff.dotProduct(pDiff)) - (r * r)
    
            discr = (b * b) - (4 * a * c)
            t = 0.0
            t2 = 0.0

            if (discr >= 0) 
                t = (-b - Math.sqrt(discr)) / (2 * a)
                t2 = (-b + Math.sqrt(discr)) / (2 * a)

            if (t > 0.0 && t <= 1.0)
                collision.time = t
            else if (t2 > 0.0 && t2 <= 1.0)
                collision.time = t2
            else
                collision.time = 1.0
    
            return true
        
        return false
    

    #This function splits particle1's velocity into parallel and perpendicular components.
    splitVelocity = (particle1, particle2) ->
        #The overall process of visualising how this works is:
        #      1. Imagine the collision happening such that particle1's velocity is rotated so that it is in one dimension, or the x-axis
        #      2. Then calculate its parallel and perpendicular components when it collides.
        #      3. Finally rotate these components back by the same amount.
        #
        #Store the current velocity in a vector structure
        velocity = new PVector(particle1.xVel, particle1.yVel)

        #Default angle
        a = Math.PI / 2
        
        #Calculate the angle of the velocity
        if (particle1.xVel != 0) 
            a = Math.atan(particle1.yVel / particle1.xVel)

        #Calculate the magnitude as if it were on the x-axis only. This was originally part of my rotate function.
        #See math/pector.js for similarities
        magnitude = (particle1.xVel * Math.cos(-a) - particle1.yVel * Math.sin(-a)) * particle1.cOR
        
        dx = particle1.x - particle2.x
        dy = particle1.y - particle2.y
        
        #Calculate the position angle
        ang = 0
        if (dx != 0) 
            ang = Math.atan(dy / dx)
         else 
            ang = Math.atan(dy / (dx - 0.00001))
        

        #This is a simplification of multiple cosines and sines using trig identities. It is essentially doing stages 2 and 3 as stated above.
        velocity.x = magnitude * (Math.cos(ang - a))
        velocity.y = magnitude * (Math.sin(ang - a))
    
        return velocity
    
    
    #This function actually handles the collision between two particles.
    handleCollision: (collision) ->
        particle = collision.particle
        particle2 = collision.particle2
        
        #Split the velocities into parallel and perpendicular components. See "splitVelocity" above.
        thisVel = splitVelocity(particle, particle2)
        particleVel = splitVelocity(particle2, particle)
        
        #Finally do some real physics. This calculates the new velocities of the parallel components as if they were one-dimensional.
        newV = ((thisVel.x * (particle.mass - particle2.mass)) + (2 * particle2.mass * particleVel.x)) / (particle.mass + particle2.mass)
        newV2 = ((particleVel.x * (particle2.mass - particle.mass)) + (2 * particle.mass * thisVel.x)) / (particle.mass + particle2.mass)
        
        #Calculate the angle between the particles
        ang = Math.atan((particle.y - particle2.y) / (particle.x - particle2.x))
    
        cosA = Math.cos(ang)
        sinA = Math.sin(ang)

        #Then these new velocityies are split further so they fit the Cartesian coordinate system. They are then added to the remaining velocity from the perpendicular components
        x1 = (newV * cosA) + (thisVel.y * sinA)
        y1 = (newV * sinA) - (thisVel.y * cosA)
 
        x2 = (newV2 * cosA) + (particleVel.y * sinA)
        y2 = (newV2 * sinA) - (particleVel.y * cosA)

        #Seperate the particles. See "seperateObjects" below.
        @seperateObjects(collision, particle, particle2)
    
        #Finally give each particle their new velocities.
        particle.xVel = x1
        particle.yVel = y1
    
        particle2.xVel = x2
        particle2.yVel = y2
    

    #This function seperates the particles after collision.
    seperateObjects: (collision, particle, particle2) ->
        #Add a small extra amount of time so that the particles can never get stuck on each other
        t = collision.time + (0.001 * collision.time)

        if (t < 1.0) 
            #Pull both particles back by the perfect collision time. See "collide" function
            particle.x -= particle.xVel * @settings.global.speedConst * t
            particle.y -= particle.yVel * @settings.global.speedConst * t
    
            particle2.x -= particle2.xVel * @settings.global.speedConst * t
            particle2.y -= particle2.yVel * @settings.global.speedConst * t
         else 
            #Failsafe method of seperating particles

            #First calculate the overlap
            dX = particle2.x - particle.x
            dY = particle2.y - particle.y
    
            sqr = (dX * dX) + (dY * dY)
            
            overlap = particle2.radius - Math.abs(Math.sqrt(sqr) - particle.radius) + 0.1
    
            vel1 = new PVector(particle.xVel, particle.yVel).getMagnitudeNS()+0.0001
            vel2 = new PVector(particle2.xVel, particle2.yVel).getMagnitudeNS()+0.0001

            #Total velocity
            vT = vel1 + vel2

            #Work out the first propotion for movement
            i = vel1 / vT
    
            ang = Math.atan2(particle.y - particle2.y, particle.x - particle2.x)
            
            #Move particle
            particle.x += overlap * Math.cos(ang) * i
            particle.y += overlap * Math.sin(ang) * i
            
            #Work out other proportion for movement
            i = 1 - i
    
            particle2.x -= overlap * Math.cos(ang) * i
            particle2.y -= overlap * Math.sin(ang) * i

    #This function causes the particles to update and react to each other. It is the heart of the system.
    update: ->
        #Loop through the particles, make sure they are not overlapping with the edges, then update their position.
        for particle in @particles
            @edgeCollision(particle, true)
            particle.update()

        #Loop through the particles, check for collisions once between pairs of particles. 
        #If colliding, add them to a collision array
        colObjects = []

        for particle, i in @particles
            for i2 in [i+1..@particles.length-1] by 1
                particle2 = @particles[i2]
    
                collision = new Collision()
                if (@collide(particle, particle2, collision)) 
                    collision.particle = particle
                    collision.particle2 = particle2
                    colObjects.push(collision)
    
        #Loop through the collision array and sort out which one happened first
        colObjects.sort (a, b) ->
            return a.time < b.time
        
        #Handle the collisions stored in the collision array. See "handleCollision" above
        for collision in colObjects
            @handleCollision(collision)

        #Finally check for an edge collision again but do not rebound the particle
        for particle in @particles 
            @edgeCollision(particle, false)