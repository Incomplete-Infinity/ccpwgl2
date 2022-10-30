import { meta } from "utils";
import { vec3, quat, mat4 } from "math";
import { Tw2PerObjectData, Tw2RawData } from "core";
import { EveChild } from "./EveChild";


@meta.type("EveChildMesh", true)
export class EveChildMesh extends EveChild
{

    @meta.string
    name = "";

    @meta.boolean
    display = true;

    @meta.matrix4
    localTransform = mat4.create();

    @meta.notImplemented
    @meta.uint
    lowestLodVisible = 2;

    @meta.struct([ "Tw2Mesh", "Tw2InstancedMesh" ])
    mesh = null;

    @meta.notImplemented
    @meta.float
    minScreenSize = 0;

    @meta.notImplemented
    @meta.uint
    reflectionType = 0;

    @meta.quaternion
    rotation = quat.create();

    @meta.vector3
    scaling = vec3.fromValues(1, 1, 1);

    @meta.notImplemented
    @meta.float
    sortValueOffset = 0;

    @meta.notImplemented
    @meta.boolean
    staticTransform = false;

    @meta.notImplemented
    @meta.list("EveChildModifier")
    transformModifiers = [];

    @meta.vector3
    translation = vec3.create();

    @meta.boolean
    useSRT = true;

    @meta.boolean
    useSpaceObjectData = true;

    @meta.uint
    @meta.notImplemented
    reflectionMode = -1;

    _worldTransform = mat4.create();
    _worldTransformLast = mat4.create();
    _perObjectData = null;


    /**
     * Gets object resources
     * @param {Array} [out=[]] - Optional receiving array
     * @returns {Array.<Tw2Resource>} [out]
     */
    GetResources(out = [])
    {
        if (this.mesh) this.mesh.GetResources(out);
        return out;
    }


    /**
     * Per frame update
     * @param {number} dt
     * @param {mat4} parentTransform
     * @param {Tw2PerObjectData|} perObjectData
     */
    Update(dt, parentTransform, perObjectData)
    {
        if (this.useSRT)
        {
            mat4.fromRotationTranslationScale(this.localTransform, this.rotation, this.translation, this.scaling);
        }

        // TODO: Figure out how this should work
        if (this.transformModifiers.length)
        {
            for (let i = 0; i < this.transformModifiers.length; i++)
            {
                if ("Modify" in this.transformModifiers[i])
                {
                    this.transformModifiers[i].Modify(this, perObjectData);
                }
            }
        }

        mat4.copy(this._worldTransformLast, this._worldTransform);
        mat4.multiply(this._worldTransform, parentTransform, this.localTransform);
    }

    /**
     * Gets render batches
     * @param {number} mode
     * @param {Tw2BatchAccumulator} accumulator
     * @param {Tw2PerObjectData} perObjectData
     * @returns {Boolean} true if batches accumulated
     */
    GetBatches(mode, accumulator, perObjectData)
    {
        if (!this.display || !this.mesh || this._lod < this.lowestLodVisible) return false;

        if (this.useSpaceObjectData)
        {
            if (!this._perObjectData)
            {
                this._perObjectData = new Tw2PerObjectData();
                this._perObjectData.vs = new Tw2RawData();
                this._perObjectData.vs.data = new Float32Array(perObjectData.vs.data.length);

                this._perObjectData.vs.data[33] = 1;
                this._perObjectData.vs.data[35] = 1;

                this._perObjectData.ps = new Tw2RawData();
                this._perObjectData.ps.data = new Float32Array(perObjectData.ps.data.length);

                this._perObjectData.ps.data[1] = 1;
                this._perObjectData.ps.data[3] = 1;
            }

            this._perObjectData.vs.data.set(perObjectData.vs.data);
            this._perObjectData.ps.data.set(perObjectData.ps.data);
            mat4.transpose(this._perObjectData.vs.data, this._worldTransform);
            mat4.transpose(this._perObjectData.vs.data.subarray(16), this._worldTransformLast);
        }
        else
        {
            if (!this._perObjectData)
            {
                this._perObjectData = Tw2PerObjectData.from(EveChild.perObjectData);
            }

            mat4.transpose(this._perObjectData.ffe.Get("world"), this._worldTransform);
            mat4.invert(this._perObjectData.ffe.Get("worldInverseTranspose"), this._worldTransform);
        }

        return this.mesh.GetBatches(mode, accumulator, this._perObjectData);
    }

}
