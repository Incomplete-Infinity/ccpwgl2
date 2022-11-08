import { meta } from "utils";
import { quat, vec3, mat4 } from "math";
import { Tw2PerObjectData, Tw2GeometryBatch, Tw2Effect } from "core";
import { device, resMan } from "global";



@meta.type("EveBanner")
@meta.notImplemented
export class EveBanner extends meta.Model // Tw2Transform
{

    @meta.string
    name = "";

    @meta.float
    @meta.notImplemented
    angleX = 0;

    @meta.float
    @meta.notImplemented
    angleY = 0;

    @meta.uint
    @meta.notImplemented
    boneIndex = -1;

    @meta.boolean
    display = true;

    @meta.vector3
    position = vec3.create();

    @meta.quaternion
    rotation = quat.create();

    @meta.vector3
    scaling = vec3.fromValues(1, 1, 1);

    @meta.uint
    @meta.notImplemented
    usage = 0;

    @meta.matrix4
    transform = mat4.create();

    @meta.struct()
    effect = new Tw2Effect();

    _perObjectData = Tw2PerObjectData.from(EveBanner.perObjectData);
    _geometryResource = resMan.GetResource("cdn:/graphics/generic/unit_plane.gr2_json");
    _localTransform = mat4.create();
    _worldTransform = mat4.create();

    // --------------------------------- testy mctest face  -------------------------//

    get imageMapResPath()
    {
        return this.effect.parameters.ImageMap ? this.effect.parameters.ImageMap.GetValue() : "";
    }

    set imageMapResPath(resPath)
    {
        this.effect.SetParameters({ "ImageMap" : resPath });
    }

    get maskMapResPath()
    {
        return this.effect.parameters.MaskMap ? this.effect.parameters.MaskMap.GetValue() : "";
    }

    set maskMapResPath(resPath)
    {
        this.effect.SetParameters({ "MaskMap": resPath });
    }

    get borderMapResPath()
    {
        return this.effect.parameters.BorderMap ? this.effect.parameters.BorderMap.GetValue() : "";
    }

    set borderMapResPath(resPath)
    {
        this.effect.SetParameters({ "BorderMap" : resPath });
    }

    // --------------------------------- testy mctest face  -------------------------//

    /**
     * Gets the item's resources
     * @param out
     * @returns {*[]}
     */
    GetResources(out = [])
    {
        if (this.effect) this.effect.GetResources(out);
        if (this._geometryResource && !out.includes(this._geometryResource))
        {
            out.push(this._geometryResource);
        }
        return out;
    }

    /**
     * Checks if the item is good
     * @returns {Boolean}
     */
    IsGood()
    {
        return !!(this.effect && this.effect.IsGood() && this._geometryResource && this._geometryResource.IsGood());
    }

    /**
     * Per frame update
     * @param dt
     */
    Update(dt)
    {

    }

    /**
     * Gets render batches
     * @param {Number} mode
     * @param {Tw2BatchAccumulator|Tw2BatchAccumulator2} accumulator
     * @param {Tw2PerObjectData} perObjectData
     * @param {mat4} parentTransform
     * @returns {boolean}
     */
    GetBatches(mode, accumulator, perObjectData, parentTransform)
    {
        if (!this.display || mode !== EveBanner.RENDER_MODE || !this.IsGood())
        {
            return false;
        }

        let hasBone;
        if (this.boneIndex > -1)
        {
            const
                mat4_0 = EveBanner.global.mat4_0,
                bones = perObjectData.vs.Get("JointMat"),
                offset = this.boneIndex * 12;

            if (bones[offset] || bones[offset + 4] || bones[offset + 8])
            {

                mat4.fromJointMatIndex(mat4_0, bones, this.boneIndex);
                mat4.multiply(mat4_0, mat4_0, this._localTransform);
                mat4.multiply(this._worldTransform, parentTransform, mat4_0);
                hasBone = true;
            }
        }

        if (!hasBone)
        {
            mat4.multiply(this._worldTransform, parentTransform, this._localTransform);
        }

        mat4.transpose(this._perObjectData.vs.Get("WorldMat"), this._worldTransform);
        this._perObjectData.ps = perObjectData.ps;

        const batch = new Tw2GeometryBatch();
        batch.renderMode = EveBanner.RENDER_MODE;
        batch.perObjectData = this._perObjectData;
        batch.geometryRes = this._geometryResource;
        batch.meshIx = 0;
        batch.start = 0;
        batch.count = this._geometryResource.meshes[0].areas.length;
        batch.effect = this.effect;
        accumulator.Commit(batch);

        return true;
    }

    static RENDER_MODE = device.RM_ADDITIVE;

    /**
     * Fires on value changes
     */
    OnValueChanged()
    {
        mat4.fromRotationTranslationScale(this._localTransform, this.rotation, this.position, this.scaling);
    }

    /**
     * Global scratch
     * @type {{mat4_0: mat4}}
     */
    static global = {
        mat4_0 : mat4.create()
    }

    /**
     * Per object data
     * @type {{vs: [[string,number]]}}
     */
    static perObjectData = {
        vs: [
            [ "WorldMat", 16 ]
        ],
    };

}
