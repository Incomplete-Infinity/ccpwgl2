import { meta } from "utils";
import { vec3, mat4 } from "math";


class EvePerMuzzleData
{

    constantDelay = 0;
    currentStartDelay = 0;
    elapsedTime = 0;
    muzzlePositionBone = null;
    muzzleTransform = mat4.create();
    readyToStart = false;
    started = false;

}


@meta.type("EveTurretFiringFX")
@meta.stage(2)
export class EveTurretFiringFX extends meta.Model
{

    @meta.string
    name = "";

    @meta.string
    boneName = "";

    @meta.boolean
    display = true;

    @meta.notImplemented
    @meta.struct("TriObserverLocal")
    destinationObserver = null;

    @meta.float
    firingDelay1 = 0;

    @meta.float
    firingDelay2 = 0;

    @meta.float
    firingDelay3 = 0;

    @meta.float
    firingDelay4 = 0;

    @meta.float
    @meta.todo("Deprecated?")
    firingDelay5 = 0;

    @meta.float
    @meta.todo("Deprecated?")
    firingDelay6 = 0;

    @meta.float
    @meta.todo("Deprecated?")
    firingDelay7 = 0;

    @meta.float
    @meta.todo("Deprecated?")
    firingDelay8 = 0;

    @meta.notImplemented
    @meta.float
    firingDurationOverride = 0;

    @meta.notImplemented
    @meta.float
    firingPeakTime = 0;

    @meta.boolean
    isLoopFiring = false;

    @meta.notImplemented
    @meta.float
    maxRadius = 0;

    @meta.float
    maxScale = 0;

    @meta.notImplemented
    @meta.float
    minRadius = 0;

    @meta.float
    minScale = 0;

    @meta.notImplemented
    @meta.boolean
    scaleEffectTarget = false;

    @meta.notImplemented
    @meta.struct("TriObserverLocal")
    sourceObserver = null;

    @meta.notImplemented
    @meta.struct("Tw2CurveSet")
    startCurveSet = null;

    @meta.notImplemented
    @meta.struct("Tw2CurveSet")
    stopCurveSet = null;

    @meta.list([ "EveStretch", "EveStretch2" ])
    stretch = [];

    @meta.boolean
    useMuzzleTransform = false;


    _endPosition = vec3.create();
    _firingDuration = 0;
    _isFiring = false;
    _perMuzzleData = [];


    /**
     * Initializes the turret firing fx
     */
    Initialize()
    {
        this._firingDuration = this.GetCurveDuration();
        for (let i = 0; i < this.stretch.length; ++i)
        {
            this._perMuzzleData[i] = new EvePerMuzzleData();
        }

        const data = this._perMuzzleData;
        if (data.length > 0) data[0].constantDelay = this.firingDelay1;
        if (data.length > 1) data[1].constantDelay = this.firingDelay2;
        if (data.length > 2) data[2].constantDelay = this.firingDelay3;
        if (data.length > 3) data[3].constantDelay = this.firingDelay4;
        if (data.length > 4) data[4].constantDelay = this.firingDelay5;
        if (data.length > 5) data[5].constantDelay = this.firingDelay6;
        if (data.length > 6) data[6].constantDelay = this.firingDelay7;
        if (data.length > 7) data[7].constantDelay = this.firingDelay8;
    }

    /**
     * Gets the total curve duration
     * @returns {number}
     */
    GetCurveDuration()
    {
        let maxDuration = 0;
        for (let i = 0; i < this.stretch.length; ++i)
        {
            const stretch = this.stretch[i];
            for (let j = 0; j < stretch.curveSets.length; ++j)
            {
                maxDuration = Math.max(maxDuration, stretch.curveSets[j].GetMaxCurveDuration());
            }
        }
        return maxDuration;
    }

    /**
     * Gets a count of stretch effects
     * @returns {Number}
     */
    GetPerMuzzleEffectCount()
    {
        return this.stretch.length;
    }

    /**
     * Sets the firing fx's end position
     * @param {vec3} v
     */
    SetEndPosition(v)
    {
        this._endPosition[0] = v[0];
        this._endPosition[1] = v[1];
        this._endPosition[2] = v[2];
    }

    /**
     * Sets muzzle bone id
     * @param {number} index
     * @param bone
     */
    SetMuzzleBoneID(index, bone)
    {
        this._perMuzzleData[index].muzzlePositionBone = bone;
    }

    /**
     * Gets a muzzle's transform
     * @param {number} index
     * @returns {mat4}
     */
    GetMuzzleTransform(index)
    {
        return this._perMuzzleData[index].muzzleTransform;
    }

    /**
     * Prepares the firing effect
     * @param {number} delay
     * @param {number} [muzzleID=-1]
     */
    PrepareFiring(delay, muzzleID = -1)
    {
        for (let i = 0; i < this.stretch.length; ++i)
        {
            if (muzzleID < 0 || muzzleID === i)
            {
                this._perMuzzleData[i].currentStartDelay = delay + this._perMuzzleData[i].constantDelay;
                this._perMuzzleData[i].started = false;
                this._perMuzzleData[i].readyToStart = false;
                this._perMuzzleData[i].elapsedTime = 0;
            }
            else
            {
                this._perMuzzleData[i].currentStartDelay = Number.MAX_VALUE;
                this._perMuzzleData[i].started = false;
                this._perMuzzleData[i].readyToStart = false;
                this._perMuzzleData[i].elapsedTime = 0;
            }
        }
        this._isFiring = true;
    }

    /**
     * Starts a muzzle effect
     * @param {number} muzzleID
     */
    StartMuzzleEffect(muzzleID)
    {
        const stretch = this.stretch[muzzleID];
        for (let i = 0; i < stretch.curveSets.length; ++i)
        {
            const curveSet = stretch.curveSets[i];
            switch (curveSet.name)
            {
                case "play_start":
                case "play_loop":
                    curveSet.PlayFrom(-this._perMuzzleData[muzzleID].currentStartDelay);
                    break;

                case "play_stop":
                    curveSet.Stop();
                    break;
            }
        }
        this._perMuzzleData[muzzleID].started = true;
        this._perMuzzleData[muzzleID].readyToStart = false;
    }

    /**
     * Stops the firing effect
     */
    StopFiring()
    {
        for (let j = 0; j < this.stretch.length; ++j)
        {
            const stretch = this.stretch[j];
            for (let i = 0; i < stretch.curveSets.length; ++i)
            {
                const curveSet = stretch.curveSets[i];
                switch (curveSet.name)
                {
                    case "play_start":
                    case "play_loop":
                        curveSet.Stop();
                        break;

                    case "play_stop":
                        curveSet.Play();
                        break;
                }
            }
            this._perMuzzleData[j].started = false;
            this._perMuzzleData[j].readyToStart = false;
            this._perMuzzleData[j].currentStartDelay = 0;
            this._perMuzzleData[j].elapsedTime = 0;
        }
        this._isFiring = false;
    }

    /**
     * Updates view dependant data
     * @param {mat4} parentTransform
     */
    UpdateViewDependentData(parentTransform)
    {
        // Eve Turret handles parentTransforms for muzzles

        for (let i = 0; i < this.stretch.length; ++i)
        {
            this.stretch[i].UpdateViewDependentData(parentTransform);
        }
    }

    /**
     * Per frame update
     * @param {number} dt - Delta time
     */
    Update(dt)
    {
        for (let i = 0; i < this.stretch.length; ++i)
        {
            if (this._perMuzzleData[i].started)
            {
                this._perMuzzleData[i].elapsedTime += dt;
            }

            if (this._perMuzzleData[i].elapsedTime < this._firingDuration || this.isLoopFiring)
            {
                if (this._isFiring)
                {
                    if (!this._perMuzzleData[i].started)
                    {
                        if (this._perMuzzleData[i].readyToStart)
                        {
                            this.StartMuzzleEffect(i);
                            this._perMuzzleData[i].currentStartDelay = 0;
                            this._perMuzzleData[i].elapsedTime = 0;
                        }
                        else
                        {
                            this._perMuzzleData[i].currentStartDelay -= dt;
                        }

                        if (this._perMuzzleData[i].currentStartDelay <= 0)
                        {
                            this._perMuzzleData[i].readyToStart = true;
                        }
                    }
                    else
                    {
                        if (this.useMuzzleTransform)
                        {
                            this.stretch[i].SetSourceTransform(this._perMuzzleData[i].muzzleTransform);
                        }
                        else
                        {
                            this.stretch[i].SetSourcePositionFromTransform(this._perMuzzleData[i].muzzleTransform);
                        }
                        this.stretch[i].SetDestinationPosition(this._endPosition);
                        this.stretch[i].SetIsNegZForward(true);
                    }
                }
            }
            this.stretch[i].Update(dt);
        }
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
        if (!this.display || !this._isFiring) return false;

        let c = accumulator.length;

        for (let i = 0; i < this.stretch.length; ++i)
        {
            if (this._perMuzzleData[i].started && (this._firingDuration >= this._perMuzzleData[i].elapsedTime || this.isLoopFiring))
            {
                this.stretch[i].GetBatches(mode, accumulator, perObjectData);
            }
        }

        return accumulator.length !== c;
    }

}
