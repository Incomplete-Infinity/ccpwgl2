import { isArrayLike, meta } from "utils";
import { mat4 } from "math";
import { Tw2VectorParameter } from "./Tw2VectorParameter";


@meta.type("Tw2Matrix4Parameter", "Tw2MatrixParameter")
export class Tw2Matrix4Parameter extends Tw2VectorParameter
{

    @meta.string
    name = "";

    @meta.matrix4
    value = mat4.create();

    /**
     * Constructor
     * @param {String} [name='']
     * @param {mat4|Float32Array} [value]
     */
    constructor(name = "", value)
    {
        super();

        if (name) this.name = name;

        if (value)
        {
            for (let i = 0; i < value.length; i++)
            {
                this.value[i] = value[i];
            }
        }

    }

    /**
     * Composes the parameter's value from components
     * @param {Tw2Vector4Parameter|quat} rotation
     * @param {Tw2Vector3Parameter|vec3} translation
     * @param {Tw2Vector3Parameter|vec3} scaling
     */
    Compose(rotation, translation, scaling)
    {
        if ("value" in rotation) rotation = rotation["value"];
        if ("value" in translation) translation = translation["value"];
        if ("value" in scaling) scaling = scaling["value"];

        mat4.fromRotationTranslationScale(this.value, rotation, translation, scaling);
        this.UpdateValues();
    }

    /**
     * Decomposes the parameter's value to components
     * @param {Tw2Vector4Parameter|quat} rotation
     * @param {Tw2Vector3Parameter|vec3} translation
     * @param {Tw2Vector3Parameter|vec3} scaling
     */
    Decompose(rotation, translation, scaling)
    {
        mat4.getRotation("value" in rotation ? rotation.value : rotation, this.value);
        mat4.getTranslation("value" in translation ? translation.value : translation, this.value);
        mat4.getScaling("value" in scaling ? scaling.value : scaling, this.value);

        if ("UpdateValues" in rotation) rotation.UpdateValues();
        if ("UpdateValues" in translation) translation.UpdateValues();
        if ("UpdateValues" in scaling) scaling.UpdateValues();
    }

    /**
     * Gets the matrices' translation x value
     * @returns {Number}
     */
    get x()
    {
        return this.GetIndexValue(12);
    }

    /**
     * Sets the matrices' translation x value
     * @param {Number} val
     */
    set x(val)
    {
        this.SetIndexValue(12, val);
    }

    /**
     * Gets the matrices' translation y value
     * @returns {Number}
     */
    get y()
    {
        return this.GetIndexValue(13);
    }

    /**
     * Sets the matrices' translation y value
     * @param {Number} val
     */
    set y(val)
    {
        this.SetIndexValue(13, val);
    }

    /**
     * Gets the matrices' translation z value
     * @returns {Number}
     */
    get z()
    {
        return this.GetIndexValue(14);
    }

    /**
     * Sets the matrices' translation z value
     * @param {Number} val
     */
    set z(val)
    {
        this.SetIndexValue(14, val);
    }

    /**
     * The parameter's constant buffer size
     * @type {Number}
     */
    static constantBufferSize = 16;

    /**
     * Checks if a value is a valid parameter input
     * - Some effect parameters are just the rotation components
     * @param {Float32Array|Array} value
     * @returns {Boolean}
     */
    static isValue(value)
    {
        return (isArrayLike(value) && value.length === 16 || value.length === 12);
    }

}
