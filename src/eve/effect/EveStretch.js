import { meta } from "utils";
import { vec3, mat4 } from "math";
import { Tw2Float } from "core";


@meta.type("EveStretch")
export class EveStretch extends meta.Model
{

    @meta.string
    name = "";

    @meta.list("Tw2CurveSet")
    curveSets = [];

    @meta.boolean
    display = true;

    @meta.struct()
    dest = null;

    @meta.struct()
    destObject = null;

    @meta.struct("Tw2Float")
    length = new Tw2Float();

    @meta.notImplemented
    @meta.struct("Tw2CurveSet")
    moveCompletion = null;

    @meta.notImplemented
    @meta.struct()
    moveObject = null;

    @meta.notImplemented
    @meta.struct("Tw2Curve")
    progressCurve = null;

    @meta.struct()
    source = null;

    @meta.notImplemented
    @meta.list("Tr2PointLight")
    sourceLights = [];

    @meta.struct()
    sourceObject = null;

    @meta.struct()
    stretchObject = null;

    @meta.boolean
    update = true;

    @meta.notImplemented
    @meta.boolean
    useCurveLod = false;


    _destinationPosition = vec3.create();
    _displayDestObject = true;
    _displaySourceObject = true;
    _isNegZForward = false;
    _useTransformsForStretch = false;
    _sourcePosition = vec3.create();
    _sourceTransform = null;
    _time = 0;
    _useParentMatrix = false;


    /**
     * Constructor
     */
    constructor()
    {
        super();
        EveStretch.init();
    }

    /**
     * Gets the stretches resources
     * @param {Array} [out=[]]
     * @return {Array<Tw2Resource>} out
     */
    GetResources(out = [])
    {
        if (this.source && this.source.GetResources)
        {
            this.source.GetResources(out);
        }

        if (this.dest && this.dest.GetResources)
        {
            this.dest.GetResources(out);
        }

        if (this.sourceObject && this.sourceObject.GetResources)
        {
            this.sourceObject.GetResources(out);
        }

        if (this.destObject && this.destObject.GetResources)
        {
            this.destObject.GetResources(out);
        }

        if (this.stretchObject && this.stretchObject.GetResources)
        {
            this.stretchObject.GetResources(out);
        }
        return out;
    }

    /**
     * Sets source's position
     * @param {vec3} position
     */
    SetSourcePosition(position)
    {
        this._useTransformsForStretch = false;
        vec3.copy(this._sourcePosition, position);
    }

    /**
     * Sets the source's position from a transform
     * @param {mat4} t
     * @constructor
     */
    SetSourcePositionFromTransform(t)
    {
        this._useTransformsForStretch = false;
        this._sourcePosition[0] = t[12];
        this._sourcePosition[1] = t[13];
        this._sourcePosition[2] = t[14];
    }

    /**
     * Sets the destination position
     * @param {vec3} position
     */
    SetDestinationPosition(position)
    {
        vec3.copy(this._destinationPosition, position);
    }

    /**
     * Sets the source transform
     * @param {mat4} transform
     */
    SetSourceTransform(transform)
    {
        this._useTransformsForStretch = true;
        this._sourceTransform = transform;
    }

    /**
     * SetIsNegZForward
     * @param {Boolean} isNegZForward
     */
    SetIsNegZForward(isNegZForward)
    {
        this._isNegZForward = isNegZForward;
    }

    /**
     * Updates view dependent data
     * @param {mat4} parentTransform
     */
    UpdateViewDependentData(parentTransform)
    {
        if (!this.display) return;

        // TODO: Handle parent scale....

        const
            g = EveStretch.global,
            directionVec = vec3.subtract(g.vec3_0, this._destinationPosition, this._sourcePosition),
            m = mat4.identity(g.mat4_0),
            x = vec3.set(g.vec3_1, 0, 0, 0),
            up = vec3.set(g.vec3_2, 0, 0, 0),
            s = mat4.identity(g.mat4_1);

        let scalingLength = vec3.length(directionVec);
        vec3.normalize(directionVec, directionVec);

        if (this._useTransformsForStretch)
        {
            mat4.rotateX(m, m, -Math.PI / 2);
            mat4.multiply(m, this._sourceTransform, m);
        }
        else
        {
            if (Math.abs(directionVec[1]) > 0.9)
            {
                up[2] = 1;
            }
            else
            {
                up[1] = 1;
            }

            vec3.cross(x, up, directionVec);
            vec3.normalize(x, x);
            vec3.cross(up, directionVec, x);
            m[0] = x[0];
            m[1] = x[1];
            m[2] = x[2];
            m[4] = -directionVec[0];
            m[5] = -directionVec[1];
            m[6] = -directionVec[2];
            m[8] = up[0];
            m[9] = up[1];
            m[10] = up[2];

            mat4.multiply(m, parentTransform, m);
        }

        if (this.destObject && this._displayDestObject)
        {
            mat4.setTranslation(m, this._destinationPosition);
            this.destObject.UpdateViewDependentData(m);
        }

        if (this.sourceObject && this._displaySourceObject)
        {
            if (this._useTransformsForStretch)
            {
                mat4.identity(m);
                mat4.rotateX(m, m, -Math.PI / 2);
                mat4.multiply(m, this._sourceTransform, m);
            }
            else
            {
                mat4.setTranslation(m, this._sourcePosition);
            }

            this.sourceObject.UpdateViewDependentData(m);
        }

        if (this.stretchObject)
        {
            if (this._useTransformsForStretch)
            {
                mat4.identity(m);
                mat4.scale(m, m, [ 1, 1, scalingLength ]);
                mat4.multiply(m, this._sourceTransform, m);
            }
            else
            {
                m[0] = x[0];
                m[1] = x[1];
                m[2] = x[2];
                m[4] = up[0];
                m[5] = up[1];
                m[6] = up[2];
                m[8] = -directionVec[0];
                m[9] = -directionVec[1];
                m[10] = -directionVec[2];
                if (this._isNegZForward) scalingLength = -scalingLength;
                mat4.scale(s, s, [ 1, 1, scalingLength ]);
                mat4.multiply(m, m, s);
            }

            this.stretchObject.UpdateViewDependentData(m);
        }
    }

    /**
     * Per frame update
     * @param {number} dt - delta time
     */
    Update(dt)
    {
        for (let i = 0; i < this.curveSets.length; ++i)
        {
            this.curveSets[i].Update(dt);
        }

        this._time += dt;

        if (this.source)
        {
            this.source.GetValueAt(this._time, this._sourcePosition);
        }
        else if (this._useTransformsForStretch)
        {
            this._sourcePosition[0] = this._sourceTransform[12];
            this._sourcePosition[1] = this._sourceTransform[13];
            this._sourcePosition[2] = this._sourceTransform[14];
        }

        if (this.dest)
        {
            this.source.GetValueAt(this._time, this._destinationPosition);
        }

        const directionVec = vec3.subtract(EveStretch.global.vec3_0, this._destinationPosition, this._sourcePosition);
        this.length.value = vec3.length(directionVec);
        vec3.normalize(directionVec, directionVec); // Unused - typo?

        if (this.sourceObject && this._displaySourceObject)
        {
            this.sourceObject.Update(dt);
        }

        if (this.destObject && this._displayDestObject)
        {
            this.destObject.Update(dt);
        }

        if (this.stretchObject)
        {
            this.stretchObject.Update(dt);
        }
    }

    /**
     * Gets render batches
     * @param {Number} mode
     * @param {Tw2BatchAccumulator} accumulator
     * @param {Tw2PerObjectData} perObjectData
     * @returns {Boolean} true if batches accumulated
     */
    GetBatches(mode, accumulator, perObjectData)
    {
        if (!this.display) return false;

        const c = accumulator.length;

        if (this.sourceObject && this._displaySourceObject)
        {
            this.sourceObject.GetBatches(mode, accumulator, perObjectData);
        }

        if (this.destObject && this._displayDestObject)
        {
            this.destObject.GetBatches(mode, accumulator, perObjectData);
        }

        if (this.stretchObject)
        {
            this.stretchObject.GetBatches(mode, accumulator, perObjectData);
        }

        return accumulator.length !== c;
    }

    /**
     * Initializes class global and scratch variables
     */
    static init()
    {
        if (!EveStretch.global)
        {
            EveStretch.global = {
                vec3_0: vec3.create(),
                vec3_1: vec3.create(),
                vec3_2: vec3.create(),
                mat4_0: mat4.create(),
                mat4_1: mat4.create()
            };
        }
    }

    /**
     * Global and scratch variables
     * @type {*}
     */
    static global = null;

}
