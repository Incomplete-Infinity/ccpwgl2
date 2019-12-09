import { meta } from "global";
import { Tw2ParticleForce } from "./Tw2ParticleForce";


/**
 * Tw2ParticleDragForce
 *
 * @property {number} drag
 */
@meta.ccp("Tr2ParticleDragForce")
export class Tw2ParticleDragForce extends Tw2ParticleForce
{

    @meta.black.float
    drag = 0.1;


    /**
     * Applies force
     * @param {Tw2ParticleElement} position - Position
     * @param {Tw2ParticleElement} velocity - Velocity
     * @param {vec3} force                  - force
     * @param {Number} [dt]                 - unused
     * @param {Number} [mass]               - unused
     */
    ApplyForce(position, velocity, force, dt, mass)
    {
        force[0] += velocity.buffer[velocity.offset] * -this.drag;
        force[1] += velocity.buffer[velocity.offset + 1] * -this.drag;
        force[2] += velocity.buffer[velocity.offset + 2] * -this.drag;
    }

}

