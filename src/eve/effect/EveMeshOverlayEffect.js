import { Tw2GeometryBatch, Tw2Effect } from "core";
import { Tw2CurveSet } from "curve";
import { meta, util, Tw2BaseClass, RM_OPAQUE, RM_TRANSPARENT, RM_ADDITIVE, RM_DECAL, RM_DISTORTION } from "global";


/**
 * Constructor for Overlay Effects
 *
 * @property {String} name                          - The overlay effect's name
 * @property {Array.<Tw2Effect>} additiveEffects    - Additive overlay effects
 * @property {Tw2CurveSet} curveSet                 - Animation curve set
 * @property {Boolean} display                      - Enables/ disables all batch accumulations
 * @property {Array.<Tw2Effect>} decalEffects       - Decal overlay effects (Is this deprecated?)
 * @property {Array.<Tw2Effect>} distortionEffects  - Distortion effects (Currently not supported)
 * @property {Array.<Tw2Effect>} opaqueEffects      - Opaque overlay effects
 * @property {Array.<Tw2Effect>} transparentEffects - Transparent overlay effects
 * @property {Boolean} update                       - Enabled updating
 * @property {{}} visible                           - Batch accumulation options for the overlay effect
 * @property {Boolean} visible.opaqueEffects        - Enables/ disables opaque effect batch accumulation
 * @property {Boolean} visible.decalEffects         - Enables/ disables decal effect batch accumulation
 * @property {Boolean} visible.transparentEffects   - Enables/ disables transparent effect batch accumulation
 * @property {Boolean} visible.additiveEffects      - Enables/ disables additive effect batch accumulation
 * @property {Boolean} visible.distortionEffects    - Currently not supported
 */
@meta.type("EveMeshOverlayEffect", true)
export class EveMeshOverlayEffect extends Tw2BaseClass
{

    @meta.black.string
    name = "";

    @meta.black.list
    additiveEffects = [];

    @meta.black.object
    curveSet = null;

    @meta.list
    @meta.todo("Deprecated?")
    decalEffects = [];

    @meta.boolean
    display = true;

    @meta.notImplemented
    @meta.black.list
    distortionEffects = [];

    @meta.black.list
    opaqueEffects = [];

    @meta.black.list
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
     */
    GetBatches(mode, accumulator, perObjectData, mesh)
    {
        if (!this.display || !mesh || !mesh.IsGood()) return;

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
        names = util.toArray(names);
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
            util.assignIfExists(item, values, [ "name", "display", "update" ]);

            if (values.curveSet)
            {
                item.curveSet = Tw2CurveSet.from(values.curveSet);
            }

            const areas = [
                "additiveEffects", "distortionEffects", "opaqueEffects", "transparentEffects", "decalEffects"
            ];

            if (values.visible)
            {
                util.assignIfExists(item.visible, values.visible, areas);
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
