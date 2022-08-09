import { meta, toArray, assignIfExists } from "utils";
import { Tw2GeometryBatch, Tw2Effect } from "core";
import { Tw2CurveSet } from "curve";
import {
    RM_OPAQUE,
    RM_TRANSPARENT,
    RM_ADDITIVE,
    RM_DECAL,
    RM_DISTORTION
} from "constant";


@meta.type("EveMeshOverlayEffect")
export class EveMeshOverlayEffect extends meta.Model
{

    @meta.string
    name = "";

    @meta.list("Tw2Effect")
    additiveEffects = [];

    @meta.struct("Tw2CurveSet")
    curveSet = null;

    @meta.list("Tw2Effect")
    decalEffects = [];

    @meta.boolean
    display = true;

    @meta.notImplemented
    @meta.list("Tw2Effect")
    distortionEffects = [];

    @meta.list("Tw2Effect")
    opaqueEffects = [];

    @meta.list("Tw2Effect")
    transparentEffects = [];

    @meta.boolean
    update = true;

    @meta.plain
    visible = {
        opaqueEffects: true,
        decalEffects: true,
        transparentEffects: true,
        additiveEffects: true,
        distortionEffects: true
    };

    /**
     * Per frame update
     * @param {number} dt - delta Time
     */
    Update(dt)
    {
        if (this.update && this.curveSet)
        {
            this.curveSet.Update(dt);
        }
    }

    /**
     * Gets render batches
     * @param {number} mode
     * @param {Tw2BatchAccumulator} accumulator
     * @param {Tw2PerObjectData} perObjectData
     * @param {Tw2Mesh} mesh
     * @returns {Boolean} true if batches accumulated
     */
    GetBatches(mode, accumulator, perObjectData, mesh)
    {
        if (!this.display || !mesh || !mesh.IsGood()) return false;

        const effects = this.GetEffects(mode);
        for (let i = 0; i < effects.length; i++)
        {
            const batch = new Tw2GeometryBatch();
            batch.renderMode = mode;
            batch.perObjectData = perObjectData;
            batch.geometryRes = mesh.geometryResource;
            batch.meshIx = mesh.meshIndex;
            batch.start = 0;
            batch.count = mesh.geometryResource.meshes[mesh.meshIndex].areas.length;
            batch.effect = effects[i];
            accumulator.Commit(batch);
        }
        return effects.length > 0;
    }

    /**
     * Gets effects
     * @param {number} mode
     * @returns {Array.<Tw2Effect>}
     */
    GetEffects(mode)
    {
        if (this.display)
        {
            switch (mode)
            {
                case RM_OPAQUE:
                    if (this.visible.opaqueEffects) return this.opaqueEffects;
                    break;

                case RM_TRANSPARENT:
                    if (this.visible.transparentEffects) return this.transparentEffects;
                    break;

                case RM_ADDITIVE:
                    if (this.visible.additiveEffects) return this.additiveEffects;
                    break;

                case RM_DECAL:
                    if (this.visible.decalEffects) return this.decalEffects;
                    break;

                case RM_DISTORTION:
                    if (this.visible.distortionEffects) return this.distortionEffects;
            }
        }
        return [];
    }

    /**
     * Creates an area's effects
     * @param {EveMeshOverlayEffect} dest
     * @param {*} src
     * @param {String|String[]} names
     */
    static createAreaEffects(dest, src, names)
    {
        names = toArray(names);
        for (let i = 0; i < names.length; i++)
        {
            const name = names[i];
            if (name in src && name in dest)
            {
                for (let i = 0; i < src[name].length; i++)
                {
                    dest[name].push(Tw2Effect.from(src[name][i]));
                }
            }
        }
    }

    /**
     * Creates a mesh from an object
     * @param {*} [values]
     * @param {*} [options]
     * @returns {EveMeshOverlayEffect}
     */
    static from(values, options)
    {
        const item = new EveMeshOverlayEffect();

        if (values)
        {
            assignIfExists(item, values, [ "name", "display", "update" ]);

            if (values.curveSet)
            {
                item.curveSet = Tw2CurveSet.from(values.curveSet);
            }

            const areas = [
                "additiveEffects", "distortionEffects", "opaqueEffects", "transparentEffects", "decalEffects"
            ];

            if (values.visible)
            {
                assignIfExists(item.visible, values.visible, areas);
            }

            this.createAreaEffects(item, values, areas);

        }

        if (!options || !options.skipUpdate)
        {
            // No Op
        }

        return item;
    }

}
