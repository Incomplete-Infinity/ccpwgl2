import { Gr2CurveDataDaK16uC16u } from "./Gr2CurveDataDaK16uC16u";
import { meta } from "utils";


@meta.type("Gr2CurveDataDaK8uC8u")
export class Gr2CurveDataDaK8uC8u extends Gr2CurveDataDaK16uC16u
{

    @meta.vector
    knotsControls = new this.constructor.ControlsConstructor(0);


    /**
     * Controls constructor
     * @type {Uint8ArrayConstructor}
     */
    static ControlsConstructor = Uint8Array;

    /**
     * GR2 curve data format
     * @type {number}
     */
    static format = 18;

    /**
     * Bytes per knot
     * @type {number}
     */
    static bytesPerKnot = 1;

}
