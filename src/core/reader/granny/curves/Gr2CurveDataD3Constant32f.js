import { Gr2Curve2 } from "./Gr2Curve2";
import { meta } from "utils";


@meta.type("Gr2CurveDataD3Constant32f")
export class Gr2CurveDataD3Constant32f extends Gr2Curve2
{

    @meta.float32Array
    controls = new Float32Array([ 0, 0, 0 ]);


    /**
     * Gets the knot count
     * @return {number}
     */
    GetKnotCount()
    {
        return 1;
    }

    /**
     * Gets knots
     * @return {Float32Array}
     */
    GetKnots()
    {
        return new Float32Array([ 0.0 ]);
    }

    /**
     * Gets points
     * @return {Float32Array}
     */
    GetVec3Buffer()
    {
        return this.controls;
    }

    /**
     * Gr2 format
     * @type {number}
     */
    static format = 4;


}
