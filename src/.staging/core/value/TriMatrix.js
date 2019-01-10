import {Tw2BaseClass} from "../../class";

/**
 * TriMatrix
 *
 * @parameter {Number} _11 -
 * @parameter {Number} _22 -
 * @parameter {Number} _23 -
 * @parameter {Number} _32 -
 * @parameter {Number} _33 -
 * @parameter {Number} _42 -
 * @parameter {Number} _43 -
 */
export default class TriMatrix extends Tw2BaseClass
{

    _11 = 0;
    _22 = 0;
    _23 = 0;
    _32 = 0;
    _33 = 0;
    _42 = 0;
    _43 = 0;

}

Tw2BaseClass.define(TriMatrix, Type =>
{
    return {
        isStaging: true,
        type: "TriMatrix",
        props: {
            _11: Type.NUMBER,
            _22: Type.NUMBER,
            _23: Type.NUMBER,
            _32: Type.NUMBER,
            _33: Type.NUMBER,
            _42: Type.NUMBER,
            _43: Type.NUMBER
        }
    };
});
