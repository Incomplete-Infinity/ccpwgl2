import { device } from "global";

/**
 * Accumulates render batches for rendering
 *
 * @property {Array.<Tw2RenderBatch>} batches - Accumulator render batches and/or child Tw2BatchAccumulators
 * @property {?function} _sortMethod          - An optional method to sort batches before rendering them
 * @class
 */
export class Tw2BatchAccumulator
{

    batches = [];
    _sortMethod = null;


    /**
     * Constructor
     * @param {?function} [sorting=null] - An optional function for sorting the collected render batches
     */
    constructor(sorting = null)
    {
        this._sortMethod = sorting;
    }

    /**
     * Gets the batch count
     * @returns {Number}
     */
    get length()
    {
        return this.batches.length;
    }

    /**
     * Commits a batch
     * @param {Tw2BatchAccumulator|Tw2RenderBatch} batch
     */
    Commit(batch)
    {
        if (this.batches.indexOf(batch) === -1)
        {
            this.batches.push(batch);
        }
    }

    /**
     * Commits batches from an array
     * @param {Array} arr
     */
    CommitFromArray(arr)
    {
        for (let i = 0; i < arr.length; i++)
        {
            this.Commit(arr[i]);
        }
    }

    /**
     * Clears any accumulated render batches
     * @returns the emptied batches
     */
    Clear()
    {
        return this.batches.splice(0);
    }

    /**
     * Renders the accumulated render batches
     * @param {String} [technique] - technique name
     */
    Render(technique="Main")
    {
        if (this._sortMethod)
        {
            this.batches.sort(this._sortMethod);
        }

        this.committed = this.committed || [];
        this.committed.splice(0);

        for (let i = 0; i < this.batches.length; ++i)
        {
            if (this.batches[i] instanceof Tw2BatchAccumulator)
            {
                this.batches[i].Render(technique);
            }
            else
            {
                if (this.batches[i].renderMode !== device.RM_ANY)
                {
                    device.SetStandardStates(this.batches[i].renderMode);
                }

                device.perObjectData = this.batches[i].perObjectData;
                this.committed.push([ this.batches[i], this.batches[i].Commit(technique) ]);
            }
        }
    }

}
