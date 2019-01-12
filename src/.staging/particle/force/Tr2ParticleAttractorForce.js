import {vec3} from "../../../global";
import {Tw2BaseClass} from "../../../global";

/**
 * Tr2ParticleAttractorForce
 * @implements ParticleForce
 *
 * @property {Number} magnitude -
 * @property {vec3} position    -
 */
export default class Tr2ParticleAttractorForce extends Tw2BaseClass
{

    magnitude = 0;
    position = vec3.create();

}

Tw2BaseClass.define(Tr2ParticleAttractorForce, Type =>
{
    return {
        isStaging: true,
        type: "Tr2ParticleAttractorForce",
        category: "ParticleForce",
        props: {
            magnitude: Type.NUMBER,
            position: Type.TR_TRANSLATION
        }
    };
});

