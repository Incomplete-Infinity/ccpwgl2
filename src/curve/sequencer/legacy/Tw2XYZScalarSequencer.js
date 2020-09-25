import { meta, vec3 } from "global";
import { Tw2CurveSequencer } from "../Tw2CurveSequencer";


@meta.ctor("Tw2XYZScalarSequencer")
export class Tw2XYZScalarSequencer extends Tw2CurveSequencer
{

    @meta.vector3
    @meta.isPrivate
    value = vec3.create();

    @meta.struct("Tw2Curve")
    XCurve = null;

    @meta.struct("Tw2Curve")
    YCurve = null;

    @meta.struct("Tw2Curve")
    ZCurve = null;


    /**
     * Sorts the sequencer
     */
    Sort()
    {
        Tw2CurveSequencer.Sort2(this);
    }

    /**
     * Gets sequencer length
     * @returns {number}
     */
    GetLength()
    {
        return Tw2CurveSequencer.GetLengthFromProperties(this);
    }

    /**
     * Updates a value at a specific time
     * @param {number} time
     */
    UpdateValue(time)
    {
        this.GetValueAt(time, this.value);
    }

    /**
     * Gets a value at a specific time
     * @param {number} time
     * @param {vec3} value
     * @returns {vec3}
     */
    GetValueAt(time, value)
    {
        value[0] = this.XCurve ? this.XCurve.GetValueAt(time) : 0;
        value[1] = this.YCurve ? this.YCurve.GetValueAt(time) : 0;
        value[2] = this.ZCurve ? this.ZCurve.GetValueAt(time) : 0;
        return value;
    }

    /**
     * The sequencer's curve dimension
     * @type {number}
     */
    static inputDimension = 1;

    /**
     * The sequencer's dimension
     * @type {number}
     */
    static outputDimension = 3;

    /**
     * The sequencer's current value property
     * @type {String}
     */
    static valueProperty = "value";

    /**
     * The sequencer's type
     * @type {number}
     */
    static curveType = Tw2CurveSequencer.Type.SEQUENCER2;

    /**
     * The sequencer's curve property names
     * @type {String[]}
     */
    static childProperties = [ "XCurve", "YCurve", "ZCurve" ];

}
