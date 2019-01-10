import {Tw2BaseClass} from "../../class";

/**
 * TriFloat
 *
 * @parameter {Number} value -
 */
export default class TriFloat extends Tw2BaseClass
{

    value = 0;

}

Tw2BaseClass.define(TriFloat, Type =>
{
    return {
        isStaging: true,
        type: "TriFloat",
        props: {
            value: Type.NUMBER
        }
    };
});
