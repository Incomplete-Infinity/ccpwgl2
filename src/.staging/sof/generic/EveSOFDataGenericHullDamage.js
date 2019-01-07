import {vec2, vec4} from "../../../global";
import {Tw2StagingClass} from "../../class";

/**
 * EveSOFDataGenericHullDamage
 *
 * @parameter {Number} hullParticleAngle               -
 * @parameter {vec4} hullParticleColor0                -
 * @parameter {vec4} hullParticleColor1                -
 * @parameter {vec4} hullParticleColor2                -
 * @parameter {Number} hullParticleColorMidpoint       -
 * @parameter {Number} hullParticleDrag                -
 * @parameter {vec2} hullParticleMinMaxLifeTime        -
 * @parameter {vec2} hullParticleMinMaxSpeed           -
 * @parameter {Number} hullParticleRate                -
 * @parameter {vec4} hullParticleSizes                 -
 * @parameter {Number} hullParticleTextureIndex        -
 * @parameter {Number} hullParticleTurbulenceAmplitude -
 * @parameter {Number} hullParticleTurbulenceFrequency -
 */
export default class EveSOFDataGenericHullDamage extends Tw2StagingClass
{

    hullParticleAngle = 0;
    hullParticleColor0 = vec4.create();
    hullParticleColor1 = vec4.create();
    hullParticleColor2 = vec4.create();
    hullParticleColorMidpoint = 0;
    hullParticleDrag = 0;
    hullParticleMinMaxLifeTime = vec2.create();
    hullParticleMinMaxSpeed = vec2.create();
    hullParticleRate = 0;
    hullParticleSizes = vec4.create();
    hullParticleTextureIndex = 0;
    hullParticleTurbulenceAmplitude = 0;
    hullParticleTurbulenceFrequency = 0;

}

Tw2StagingClass.define(EveSOFDataGenericHullDamage, Type =>
{
    return {
        type: "EveSOFDataGenericHullDamage",
        props: {
            hullParticleAngle: Type.NUMBER,
            hullParticleColor0: Type.RGBA_LINEAR,
            hullParticleColor1: Type.RGBA_LINEAR,
            hullParticleColor2: Type.RGBA_LINEAR,
            hullParticleColorMidpoint: Type.NUMBER,
            hullParticleDrag: Type.NUMBER,
            hullParticleMinMaxLifeTime: Type.VECTOR2,
            hullParticleMinMaxSpeed: Type.VECTOR2,
            hullParticleRate: Type.NUMBER,
            hullParticleSizes: Type.VECTOR4,
            hullParticleTextureIndex: Type.NUMBER,
            hullParticleTurbulenceAmplitude: Type.NUMBER,
            hullParticleTurbulenceFrequency: Type.NUMBER
        }
    };
});
