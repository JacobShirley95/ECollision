/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let SimulationEngine;
import Particle from '../objects/particle';
import PVector from '../math/pvector';
import EventManager from '../events/event-manager';

export default (SimulationEngine = (function() {
    let Collision = undefined;
    let splitVelocity = undefined;
    SimulationEngine = class SimulationEngine {
        static initClass() {
            this.prototype.particles = [];
        
            //Collision class that stores which objects collided and a time constant of how much to seperate them by.
            Collision = class Collision {
                static initClass() {
                    this.prototype.time = 0.0;
                    this.prototype.particle = null;
                    this.prototype.particle2 = null;
                }
            };
            Collision.initClass();
        
    
            //This function splits particle1's velocity into parallel and perpendicular components.
            splitVelocity = function(particle1, particle2) {
                //The overall process of visualising how this works is:
                //      1. Imagine the collision happening such that particle1's velocity is rotated so that it is in one dimension, or the x-axis
                //      2. Then calculate its parallel and perpendicular components when it collides.
                //      3. Finally rotate these components back by the same amount.
                //
                //Store the current velocity in a vector structure
                const velocity = new PVector(particle1.xVel, particle1.yVel);
    
                //Default angle
                let a = Math.PI / 2;
            
                //Calculate the angle of the velocity
                if (particle1.xVel !== 0) { 
                    a = Math.atan(particle1.yVel / particle1.xVel);
                }
    
                //Calculate the magnitude as if it were on the x-axis only. This was originally part of my rotate function.
                //See math/pector.js for similarities
                const magnitude = ((particle1.xVel * Math.cos(-a)) - (particle1.yVel * Math.sin(-a))) * particle1.cOR;
            
                const dx = particle1.x - particle2.x;
                const dy = particle1.y - particle2.y;
            
                //Calculate the position angle
                let ang = 0;
                if (dx !== 0) { 
                    ang = Math.atan(dy / dx);
                 } else { 
                    ang = Math.atan(dy / (dx - 0.00001));
                }
            
    
                //This is a simplification of multiple cosines and sines using trig identities. It is essentially doing stages 2 and 3 as stated above.
                velocity.x = magnitude * (Math.cos(ang - a));
                velocity.y = magnitude * (Math.sin(ang - a));
        
                return velocity;
            };
        }
    
        constructor(width, height, settings) {
            this.width = width;
            this.height = height;
            this.settings = settings;
            EventManager.eventify(this);
        }

        setBounds(width, height) {
            this.width = width;
            this.height = height;
        }

        reset() {
            return this.particles = [];
        }

        //his detects if there is an edge collision.
        edgeCollision(particle, rebound) {
            const { cOR } = particle;

            //If the particle is outside the width set, it will be placed back inside
            if ((particle.x + particle.radius) >= this.width) {
                if (rebound) {
                    //The particle may lose energy if it's coefficient of restitution is less than 1.
                    particle.xVel *= -cOR;
                    particle.yVel *= cOR;
                } else { 
                    particle.x = this.width - particle.radius;
                }
            
            } else if ((particle.x - particle.radius) <= 0) { 
                if (rebound) {
                    particle.xVel *= -cOR;
                    particle.yVel *= cOR;
                } else {
                    particle.x = particle.radius;
                }
            }
        
            //If the particle is outside the height set, it will be placed back inside
            if ((particle.y + particle.radius) >= this.height) {
                if (rebound) {
                    particle.xVel *= cOR;
                    return particle.yVel *= -cOR;
                } else {
                    return particle.y = this.height - particle.radius;
                }
            
            } else if ((particle.y - particle.radius) <= 0) { 
                if (rebound) {
                    particle.xVel *= cOR;
                    return particle.yVel *= -cOR;
                } else {
                    return particle.y = particle.radius;
                }
            }
        }
    
        //This functions checks for a collision and returns true or false if yes. It also calculates the required amount of time to seperate the particles.
        collide(particle, particle2, collision) {
            //Take the distances between the particles on the x and y axes
            const dX = particle2.x - particle.x;
            const dY = particle2.y - particle.y;
        
            //Calculate the square of the distance
            const sqr = (dX * dX) + (dY * dY);
            const r = particle2.radius + particle.radius;
        
            this.fire("check-collision", [particle, particle2, sqr]);

            //Could sqrt to get the distance, but there's no need because the otherside would also have to be sqrted
            if (sqr < (r * r)) {
                //Now to get the time constant between the last update and this update at which the particles would have collided perfectly
                //Put into pvectors as we need to get the dot products
                const pDiff = new PVector(particle.x - particle2.x, particle.y - particle2.y);
                const vDiff = new PVector(particle.xVel - particle2.xVel, particle.yVel - particle2.yVel);
            
                //The following can be derived thus:
                //          At the time of a perfect collision:
                //              let dx = particle2_currentX - particle1_currentX
                //              let dy = particle2_currentY - particle1_currentY
                //
                //              let diffVelocityX = particle2_velocityX-particle1_velocityX
                //              let diffVelocityY = particle2_velocityY-particle1_velocityY
                //
                //              let particle1_xFinal = particle1_currentX - (particle1_velocityX * time)
                //              let particle1_yFinal = particle1_currentY - (particle1_velocityY * time)
                //
                //              let particle2_xFinal = particle2_currentX - (particle2_velocityX * time)
                //              let particle2_yFinal = particle2_currentY - (particle2_velocityY * time)
                //
                //          We need to solve for time:
                //              let diffX = particle2_xFinal-particle1_xFinal
                //              let diffY = particle2_yFinal-particle1_yFinal
                //
                //          Rearranging and subbing-in this gives:
                //              diffX = particle2_currentX - (particle2_velocityX * time) - particle1_currentX - (particle1_velocityX * time) 
                //                    = (particle2_currentX - particle1_currentX) - time*(particle2_velocityX-particle1_velocityX) 
                //                    = dx - time*diffVelocityX
                //
                //              diffY = particle2_currentY - (particle2_velocityY * time) - particle1_currentY - (particle1_velocityY * time) 
                //                    = (particle2_currentY - particle1_currentY) - time*(particle2_velocityY-particle1_velocityY)
                //                    = dy - time*diffVelocityY          
                //
                //          Now it is just like a collision check, as above, except this time we can solve for time:
                //              let sqr = sqr(diffX) + sqr(diffY) 
                //                      = sqr(dx - time*diffVelocityX) + sqr(dy - time*diffVelocityY)
                //
                //          Now to expand the brackets:
                //              sqr = sqr(dx) - 2*time*diffVelocityX*dx + sqr(time)*sqr(diffVelocityX) + sqr(dy) - 2*time*diffVelocityY*dy + sqr(time)*sqr(diffVelocityY)
                //              
                //          We're trying to find time, and or a perfect collision, sqr must equal the sum of the radii squared
                //          So our quadratic equation is:
                //              let radiiSqred = sqr(particle1_radius+particle2_radius)
                //
                //              sqr = a*sqr(time) + b*time + c-radiiSqred = 0
                //              a = sqr(diffVelocityX)+sqr(diffVelocityY) (NOTE: dotProduct as below)
                //              b = -2*(dx*diffVelocityX + diffVelocityY*dy) (NOTE: dotProduct as below)
                //              c = sqr(dx)+sqr(dy) - radiiSqred
                //          
                //          We then use the quadratic formula (-b +- sqrt(b*b - 4*a*c))/(2*a) to calculate time
                const a = vDiff.dotProduct(vDiff);
                const b = -2 * vDiff.dotProduct(pDiff);
                const c = (pDiff.dotProduct(pDiff)) - (r * r);
    
                const discr = (b * b) - (4 * a * c);
                let t = 0.0;
                let t2 = 0.0;

                if (discr >= 0) { 
                    t = (-b - Math.sqrt(discr)) / (2 * a);
                    t2 = (-b + Math.sqrt(discr)) / (2 * a);
                }

                if ((t > 0.0) && (t <= 1.0)) {
                    collision.time = t;
                } else if ((t2 > 0.0) && (t2 <= 1.0)) {
                    collision.time = t2;
                } else {
                    collision.time = 1.0;
                }
    
                return true;
            }
        
            return false;
        }
    
        //This function actually handles the collision between two particles.
        handleCollision(collision) {
            const { particle } = collision;
            const { particle2 } = collision;
        
            //Split the velocities into parallel and perpendicular components. See "splitVelocity" above.
            const thisVel = splitVelocity(particle, particle2);
            const particleVel = splitVelocity(particle2, particle);
        
            //Finally do some real physics. This calculates the new velocities of the parallel components as if they were one-dimensional.
            const newV = ((thisVel.x * (particle.mass - particle2.mass)) + (2 * particle2.mass * particleVel.x)) / (particle.mass + particle2.mass);
            const newV2 = ((particleVel.x * (particle2.mass - particle.mass)) + (2 * particle.mass * thisVel.x)) / (particle.mass + particle2.mass);
        
            //Calculate the angle between the particles
            const ang = Math.atan((particle.y - particle2.y) / (particle.x - particle2.x));
    
            const cosA = Math.cos(ang);
            const sinA = Math.sin(ang);

            //Then these new velocityies are split further so they fit the Cartesian coordinate system. They are then added to the remaining velocity from the perpendicular components
            const x1 = (newV * cosA) + (thisVel.y * sinA);
            const y1 = (newV * sinA) - (thisVel.y * cosA);
 
            const x2 = (newV2 * cosA) + (particleVel.y * sinA);
            const y2 = (newV2 * sinA) - (particleVel.y * cosA);

            //Seperate the particles. See "seperateObjects" below.
            this.seperateObjects(collision, particle, particle2);
    
            //Finally give each particle their new velocities.
            particle.xVel = x1;
            particle.yVel = y1;
    
            particle2.xVel = x2;
            return particle2.yVel = y2;
        }

        //This function seperates the particles after collision.
        seperateObjects(collision, particle, particle2) {
            //Add a small extra amount of time so that the particles can never get stuck on each other
            const t = collision.time + (0.001 * collision.time);

            if (t < 1.0) { 
                //Pull both particles back by the perfect collision time. See "collide" function
                particle.x -= particle.xVel * this.settings.global.speedConst * t;
                particle.y -= particle.yVel * this.settings.global.speedConst * t;
    
                particle2.x -= particle2.xVel * this.settings.global.speedConst * t;
                return particle2.y -= particle2.yVel * this.settings.global.speedConst * t;
             } else { 
                //Failsafe method of seperating particles

                //First calculate the overlap
                const dX = particle2.x - particle.x;
                const dY = particle2.y - particle.y;
    
                const sqr = (dX * dX) + (dY * dY);
            
                const overlap = (particle2.radius - Math.abs(Math.sqrt(sqr) - particle.radius)) + 0.1;
    
                const vel1 = new PVector(particle.xVel, particle.yVel).getMagnitudeNS()+0.0001;
                const vel2 = new PVector(particle2.xVel, particle2.yVel).getMagnitudeNS()+0.0001;

                //Total velocity
                const vT = vel1 + vel2;

                //Work out the first propotion for movement
                let i = vel1 / vT;
    
                const ang = Math.atan2(particle.y - particle2.y, particle.x - particle2.x);
            
                //Move particle
                particle.x += overlap * Math.cos(ang) * i;
                particle.y += overlap * Math.sin(ang) * i;
            
                //Work out other proportion for movement
                i = 1 - i;
    
                particle2.x -= overlap * Math.cos(ang) * i;
                return particle2.y -= overlap * Math.sin(ang) * i;
            }
        }

        //This function causes the particles to update and react to each other. It is the heart of the system.
        update() {
            //Loop through the particles, make sure they are not overlapping with the edges, then update their position.
            let collision;
            for (var particle of Array.from(this.particles)) {
                this.edgeCollision(particle, true);
                particle.update();
            }

            //Loop through the particles, check for collisions once between pairs of particles. 
            //If colliding, add them to a collision array
            const colObjects = [];

            for (let i = 0; i < this.particles.length; i++) {
                particle = this.particles[i];
                for (let i2 = i+1, end = this.particles.length-1; i2 <= end; i2++) {
                    const particle2 = this.particles[i2];
    
                    collision = new Collision();
                    if (this.collide(particle, particle2, collision)) { 
                        collision.particle = particle;
                        collision.particle2 = particle2;
                        colObjects.push(collision);
                    }
                }
            }
    
            //Loop through the collision array and sort out which one happened first
            colObjects.sort((a, b) => a.time < b.time);
        
            //Handle the collisions stored in the collision array. See "handleCollision" above
            for (collision of Array.from(colObjects)) {
                this.handleCollision(collision);
            }

            //Finally check for an edge collision again but do not rebound the particle
            for (particle of Array.from(this.particles)) { 
                this.edgeCollision(particle, false);
            }

            return this.fire("update");
        }
    };
    SimulationEngine.initClass();
    return SimulationEngine;
})());