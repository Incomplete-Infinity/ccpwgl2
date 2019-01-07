import {quat, vec3} from "../../../global";
import {Tw2StagingClass} from "../../class";

/**
 * EveChildCloud
 * @implements ObjectChild
 *
 * @parameter {Number} cellScreenSize      -
 * @parameter {Tw2Effect} effect           -
 * @parameter {Number} preTesselationLevel -
 * @parameter {quat} rotation              -
 * @parameter {vec3} scaling               -
 * @parameter {Number} sortingModifier     -
 * @parameter {vec3} translation           -
 */
export default class EveChildCloud extends Tw2StagingClass
{

    cellScreenSize = 0;
    effect = null;
    preTesselationLevel = 0;
    rotation = quat.create();
    scaling = vec3.fromValues(1, 1, 1);
    sortingModifier = 0;
    translation = vec3.create();

}

Tw2StagingClass.define(EveChildCloud, Type =>
{
    return {
        type: "EveChildCloud",
        category: "ObjectChild",
        props: {
            cellScreenSize: Type.NUMBER,
            effect: ["Tw2Effect"],
            preTesselationLevel: Type.NUMBER,
            rotation: Type.TR_ROTATION,
            scaling: Type.TR_SCALING,
            sortingModifier: Type.NUMBER,
            translation: Type.TR_TRANSLATION
        }
    };
});
