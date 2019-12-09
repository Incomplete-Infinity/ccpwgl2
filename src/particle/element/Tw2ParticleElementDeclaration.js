import { Tw2VertexElement } from "core";
import { Tw2ParticleElement } from "./Tw2ParticleElement";
import { meta, Tw2BaseClass } from "global";


/**
 * Tw2ParticleElementDeclaration
 *
 * @property {String} customName  -
 * @property {Number} dimension   -
 * @property {Number} elementType -
 * @property {Number} usageIndex  -
 * @property {Boolean} usedByGPU  -
 */
@meta.ccp("Tr2ParticleElementDeclaration")
export class Tw2ParticleElementDeclaration extends Tw2BaseClass
{

    @meta.black.string
    customName = "";

    @meta.black.uint
    dimension = 1;

    @meta.black.uint
    elementType = Tw2ParticleElement.Type.CUSTOM;

    @meta.black.uint
    usageIndex = 0;

    @meta.black.boolean
    usedByGPU = true;


    /**
     * Gets the element's dimension
     * @returns {number}
     */
    GetDimension()
    {
        switch (this.elementType)
        {
            case Tw2ParticleElement.Type.LIFETIME:
                return 2;

            case Tw2ParticleElement.Type.POSITION:
                return 3;

            case Tw2ParticleElement.Type.VELOCITY:
                return 3;

            case Tw2ParticleElement.Type.MASS:
                return 1;
        }
        return this.dimension;
    }

    /**
     * Gets the object's vertex declaration
     * @returns {Tw2VertexElement}
     */
    GetDeclaration()
    {
        let usage;
        switch (this.elementType)
        {
            case Tw2ParticleElement.Type.LIFETIME:
                usage = Tw2VertexElement.Type.TANGENT;
                break;

            case Tw2ParticleElement.Type.POSITION:
                usage = Tw2VertexElement.Type.POSITION;
                break;

            case Tw2ParticleElement.Type.VELOCITY:
                usage = Tw2VertexElement.Type.NORMAL;
                break;

            case Tw2ParticleElement.Type.MASS:
                usage = Tw2VertexElement.Type.BINORMAL;
                break;

            default:
                usage = Tw2VertexElement.Type.TEXCOORD;
        }

        return Tw2VertexElement.from({
            usage: usage,
            usageIndex: this.usageIndex,
            elements: this.GetDimension()
        });
    }

}
