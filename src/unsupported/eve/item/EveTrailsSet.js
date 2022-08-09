import { meta } from "utils";
import { tw2 } from "global";
import { Tw2RenderBatch } from "core/batch";


@meta.notImplemented
export class EveTrailSetRenderBatch extends Tw2RenderBatch
{

    trailsSet = null;

    /**
     * Commits the batch
     * @param {String} [technique] - technique name
     */
    Commit(technique)
    {
        this.trailsSet.Render(technique);
    }

    /**
     * Checks if the render batch supports a technique
     * @param {String} technique
     * @returns {boolean}
     */
    HasTechnique(technique)
    {
        return this.trailsSet && this.trailsSet.effect && this.trailsSet.effect.HasTechnique(technique);
    }

}


@meta.notImplemented
@meta.type("EveTrailSet")
export class EveTrailsSet extends meta.Model
{

    @meta.struct()
    effect = null;

    @meta.path
    geometryResPath = "";

    @meta.boolean
    display = true;


    _geometryRes = null;


    /**
     * Initializes the object
     */
    Initialize()
    {
        if (this.geometryResPath)
        {
            this._geometryRes = tw2.GetResource(this.geometryResPath, res => this.OnResPrepared(res));
        }
    }

    /**
     * Rebuilds cached data
     * @param {Tw2GeometryRes} res
     */
    OnResPrepared(res)
    {
        //TODO: OnResPrepared
    }

    /**
     * Gets resources
     * @param {Array} [out=[]]
     * @returns {Array<Tw2Resource>}
     */
    GetResources(out = [])
    {
        if (this.effect)
        {
            this.effect.GetResources(out);
        }

        if (this._geometryRes && !out.includes(this._geometryRes))
        {
            out.push(this._geometryRes);
        }

        return out;
    }

}
