import { num, vec3, vec4, mat4 } from "math";
import { assignIfExists, get, isNumber, isString } from "utils";
import { Tw2Error } from "../Tw2Error";
import { Tw2EventEmitter } from "../Tw2EventEmitter";
import { Tw2Effect } from "../mesh/Tw2Effect";
import { Tw2VertexDeclaration } from "../vertex/Tw2VertexDeclaration";

import {
    RM_ANY,
    RM_OPAQUE,
    RM_DECAL,
    RM_TRANSPARENT,
    RM_ADDITIVE,
    RM_FULLSCREEN,
    RM_PICKABLE,
    RM_DEPTH,
    RM_DISTORTION,
    RM_NORMAL,
    RS_ZENABLE,
    RS_ZWRITEENABLE,
    RS_ALPHATESTENABLE,
    RS_SRCBLEND,
    RS_DESTBLEND,
    RS_CULLMODE,
    RS_ZFUNC,
    RS_ALPHAREF,
    RS_ALPHAFUNC,
    RS_ALPHABLENDENABLE,
    RS_CLIPPING,
    RS_CLIPPLANEENABLE,
    RS_COLORWRITEENABLE,
    RS_BLENDOP,
    RS_SCISSORTESTENABLE,
    RS_SLOPESCALEDEPTHBIAS,
    RS_DEPTHBIAS,
    RS_SEPARATEALPHABLENDENABLE,
    RS_SRCBLENDALPHA,
    RS_DESTBLENDALPHA,
    RS_BLENDOPALPHA,
    CULL_NONE,
    CULL_CW,
    CULL_CCW,
    CMP_NEVER,
    CMP_LESS,
    CMP_EQUAL,
    CMP_LEQUAL,
    CMP_GREATER,
    CMP_GREATEREQUAL,
    CMP_ALWAYS,
    BLEND_ONE,
    BLEND_SRCALPHA,
    BLEND_INVSRCALPHA,
    BLENDOP_ADD,
    BLENDOP_SUBTRACT,
    BLENDOP_REVSUBTRACT,
    BlendTable,
    VendorWebglPrefixes,
    VendorRequestAnimationFrame,
    VendorCancelAnimationFrame
} from "constant";



export class Tw2Device extends Tw2EventEmitter
{
    name = "Device";

    /**
     *
     * @type {null|WebGLRenderingContext|WebGL2RenderingContext}
     */
    gl = null;
    canvas2d = null;
    autoClearCanvas2dPerFrame = true;
    autoClearCanvas2dOnResize = true;

    dt = 0;
    fps = 0;

    frameCounter = 0;
    startTime = null;
    currentTime = null;
    previousTime = null;

    eyePosition = vec3.create();
    targetResolution = vec4.create();
    world = mat4.create();
    view = mat4.create();
    viewInverse = mat4.create();
    viewTranspose = mat4.create();
    projection = mat4.create();
    projectionInverse = mat4.create();
    projectionTranspose = mat4.create();
    viewProjection = mat4.create();
    viewProjectionTranspose = mat4.create();
    viewProjectionInverse = mat4.create();
    _viewProjectionDirty = true;

    viewportWidth = 0;
    viewportHeight = 0;
    viewportAspect = 0;
    viewportPixelRatio = ("devicePixelRatio" in window) ? window.devicePixelRatio : 1;

    effectDir = "/effect.gles2/";
    mipLevelSkipCount = 0;
    shaderModel = "hi";
    enableAnisotropicFiltering = true;
    enableAntialiasing = true;
    enableWebgl2 = true;
    enableWebxr = true;

    alphaBlendBackBuffer = false;
    antialiasing = true;
    msaaSamples = 0;
    wrapModes = [];

    perFrameVSData = null;
    perFramePSData = null;
    perFrameCustomSceneVSData = null;
    perFrameCustomScenePSData = null;

    pickDepth = 16;

    _extensions = {};
    _alphaBlendState = null;
    _alphaTestState = null;
    _depthOffsetState = null;
    _shadowStateBuffer = null;
    _shadowHandles = null;
    _quadBuffer = null;
    _quadDecl = null;
    _cameraQuadBuffer = null;
    _currentRenderMode = RM_ANY;
    _fallbackCube = null;
    _fallbackTexture = null;
    _blitEffect = null;
    _Date = Date;

    _fpsFrameCount = 0;
    _fpsPreviousTime = 0;

    /**
     * Default webgl context parameters
     * @type {Object}
     * @private
     */
    _glParams = {
        alpha: true,
        depth: true,
        stencil: false,
        antialias: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        powerPreference: "default",
        failIfMajorPerformanceCaveat: false,
        descynchronized: false
    };

    /**
     * Gets the current gl context version
     * @returns {number}
     */
    get glVersion()
    {
        if (!this.gl)
        {
            throw new ErrWebglContext({ message: "No webgl context" });
        }

        return this.gl instanceof WebGLRenderingContext ? 1 : 2;
    }

    /**
     * Gets the current gl canvas
     * @returns {null}
     */
    get canvas()
    {
        return this.gl ? this.gl.canvas : null;
    }

    /**
     * Constructor
     * @param {Tw2Library} tw2
     */
    constructor(tw2)
    {
        super();
        this.tw2 = tw2;
        this.startTime = this.now;
        this.currentTime = this.startTime;

        const opaqueStates = {
            [RS_ALPHABLENDENABLE]: 0,
            [RS_ALPHATESTENABLE]: 0,
            [RS_SEPARATEALPHABLENDENABLE]: 0,
            [RS_ZENABLE]: 1,
            [RS_ZWRITEENABLE]: 1,
            [RS_ZFUNC]: CMP_LEQUAL,
            [RS_CULLMODE]: CULL_CW,
            [RS_SLOPESCALEDEPTHBIAS]: 0,
            [RS_DEPTHBIAS]: 0,
            [RS_COLORWRITEENABLE]: 0xf
        };

        const transparentStates = {
            [RS_CULLMODE]: CULL_CW,
            [RS_ALPHATESTENABLE]: 0,
            [RS_ALPHABLENDENABLE]: 1,
            [RS_SRCBLEND]: BLEND_SRCALPHA,
            [RS_DESTBLEND]: BLEND_INVSRCALPHA,
            [RS_BLENDOP]: BLENDOP_ADD,
            [RS_ZENABLE]: 1,
            [RS_ZWRITEENABLE]: 0, // Should this be true for RM_DISTORTION?
            [RS_ZFUNC]: CMP_LEQUAL,
            [RS_SLOPESCALEDEPTHBIAS]: 0, // -1.0
            [RS_DEPTHBIAS]: 0,
            [RS_SEPARATEALPHABLENDENABLE]: 0,
            [RS_COLORWRITEENABLE]: 0xf
        };

        this._renderStates = {
            [RM_DEPTH]: {
                dirty: true,
                states: Object.assign({}, opaqueStates)
            },
            [RM_OPAQUE]: {
                dirty: true,
                states: Object.assign({}, opaqueStates)
            },
            [RM_PICKABLE]: {
                dirty: true,
                states: Object.assign({}, opaqueStates)
            },
            [RM_NORMAL]: {
                dirty: true,
                states: Object.assign({}, opaqueStates)
            },
            [RM_DISTORTION]: {
                dirty: true,
                states: Object.assign({}, transparentStates)
            },
            [RM_TRANSPARENT]: {
                dirty: true,
                states: Object.assign({}, transparentStates)
            },
            [RM_DECAL]: {
                dirty: true,
                states: {
                    [RS_ALPHATESTENABLE]: 0,
                    [RS_ALPHABLENDENABLE]: 1,
                    [RS_SEPARATEALPHABLENDENABLE]: 0,
                    [RS_ZENABLE]: 1,
                    [RS_ZWRITEENABLE]: 1,
                    [RS_ZFUNC]: CMP_LEQUAL,
                    [RS_CULLMODE]: CULL_CW,
                    [RS_SLOPESCALEDEPTHBIAS]: 0,
                    [RS_DEPTHBIAS]: 0,
                    [RS_COLORWRITEENABLE]: 0xf,
                    [RS_SRCBLEND]: BLEND_SRCALPHA,
                    [RS_DESTBLEND]: BLEND_INVSRCALPHA,
                    [RS_ALPHAFUNC]: CMP_GREATER,
                    [RS_ALPHAREF]: 127,
                    [RS_BLENDOP]: BLENDOP_ADD,
                }
            },
            [RM_ADDITIVE]: {
                dirty: true,
                states: {
                    [RS_CULLMODE]: CULL_NONE,
                    [RS_ALPHABLENDENABLE]: 1,
                    [RS_SRCBLEND]: BLEND_ONE,
                    [RS_DESTBLEND]: BLEND_ONE,
                    [RS_BLENDOP]: BLENDOP_ADD,
                    [RS_ZENABLE]: 1,
                    [RS_ZWRITEENABLE]: 0,
                    [RS_ZFUNC]: CMP_LEQUAL,
                    [RS_ALPHATESTENABLE]: 0,
                    [RS_SLOPESCALEDEPTHBIAS]: 0,
                    [RS_DEPTHBIAS]: 0,
                    [RS_SEPARATEALPHABLENDENABLE]: 0,
                    [RS_COLORWRITEENABLE]: 0xf
                }
            },
            [RM_FULLSCREEN]: {
                dirty: true,
                states: {
                    [RS_ALPHABLENDENABLE]: 0,
                    [RS_ALPHATESTENABLE]: 0,
                    [RS_CULLMODE]: CULL_NONE,
                    [RS_ZENABLE]: 0,
                    [RS_ZWRITEENABLE]: 0,
                    [RS_ZFUNC]: CMP_ALWAYS,
                    [RS_SLOPESCALEDEPTHBIAS]: 0,
                    [RS_DEPTHBIAS]: 0,
                    [RS_SEPARATEALPHABLENDENABLE]: 0,
                    [RS_COLORWRITEENABLE]: 0xf
                }
            }
        };


    }

    /**
     * Sets shadow handles
     * @param {WebGLProgram} program
     */
    SetShadowHandles(program)
    {
        this._shadowHandles = program;
    }


    /**
     * Registers options
     * Todo: Add custom render states
     * @param {*} [opt]
     * @param {Number} opt.textureQuality
     * @param {Number} opt.shaderQuality
     * @param {Boolean} opt.anisotropicFilter
     * @param {Boolean} opt.antialiasing
     * @param {Boolean} opt.webgl2
     * @param {Boolean} opt.webvr
     */
    Register(opt)
    {
        if (!opt) return;

        if (this.gl)
        {
            throw new Error("Setting device options after gl creation is not supported");
        }

        if ("glParams" in opt)
        {
            assignIfExists(this._glParams, opt.glParams, [
                "alpha", "depth", "stencil", "antialias",
                "premultipliedAlpha", "preserveDrawingBuffer",
                "powerPreference", "failIfMajorPerformanceCaveat",
                "descynchronized"
            ]);
        }

        if ("events" in opt) this.AddEvents(opt.events);

        if ("performanceClock" in opt)
        {
            if (opt.performance && "performance" in window)
            {
                this._Date = performance;
            }
            else
            {
                this._Date = Date;
            }
        }

        if ("textureQuality" in opt) this.mipLevelSkipCount = opt.textureQuality;
        if ("shaderQuality" in opt) this.shaderModel = opt.shaderQuality;
        if ("anisotropicFilter" in opt) this.enableAnisotropicFiltering = opt.anisotropicFilter;
        if ("antialiasing" in opt) this.enableAntialiasing = opt.antialiasing;
        if ("webgl2" in opt) this.enableWebgl2 = opt.webgl2;
        if ("webxr" in opt) this.enableWebxr = opt.webxr;

        assignIfExists(this, opt, [
            "autoClearCanvas2dPerFrame",
            "autoClearCanvas2dOnResize"
        ]);

    }


    /**
     * Gets the gl parameters passed to the gl context
     * @return {Object|null}
     */
    GetGLParams()
    {
        return this.gl ? Object.assign({}, this._glParams) : null;
    }

    /**
     * Creates webgl Device
     * @param  {HTMLCanvasElement|String} canvas3d    - 3d canvas
     * @param {HTMLCanvasElement|String} [canvas2d] - optional 2d canvas
     * @param {Object} [glParams]                   - gl parameters
     * @throws ErrWebglContext                      - When unable to create a webgl context
     */
    Create({ canvas, canvas3d, canvas2d, glParams } = {})
    {
        this.gl = null;
        this.effectDir = "/effect.gles2/";

        // Fallback
        if (!canvas) canvas = canvas3d;

        // Register any settings
        if (glParams) this.Register({ glParams });

        // Disable antialiasing if required
        if (!this.enableAntialiasing)
        {
            this._glParams.antialias = false;
        }

        // Extend standard gl params
        const params = Object.assign({}, this._glParams, {
            webgl2: this.enableWebgl2,
            xrCompatible: this.enableWebxr
        });

        try
        {
            this.gl = Tw2Device.CreateContext(params, canvas);
            this.EmitEvent("context_created", this);
        }
        catch (err)
        {
            this.EmitEvent("context_failed", this);
            throw err;
        }

        const { gl } = this;

        this.tw2.Debug({
            name: "Device",
            message: `Webgl${this.glVersion} context created`
        });

        // Allow for a 2d canvas
        if (canvas2d)
        {
            try
            {
                this.canvas2d = isString(canvas2d) ? document.getElementById(canvas2d) : canvas2d;
            }
            catch (err)
            {
                throw new Error("Invalid 2d canvas");
            }
        }

        const
            returnFalse = () => false,
            returnTrue = () => true;

        // Handle different webgl versions
        if (this.glVersion === 1)
        {
            if (params.depth) this.GetExtension("WEBGL_depth_texture");
            this.GetExtension("OES_standard_derivatives");
            this.GetExtension("OES_element_index_uint");
            this.GetExtension("OES_texture_float");
            this.GetExtension("EXT_shader_texture_lod");
            const iArray = this.GetExtension("ANGLE_instanced_arrays");
            gl.drawElementsInstanced = iArray ? iArray["drawElementsInstancedANGLE"].bind(iArray) : returnFalse;
            gl.drawArraysInstanced = iArray ? iArray["drawArraysInstancedANGLE"].bind(iArray) : returnFalse;
            gl.vertexAttribDivisor = iArray ? iArray["vertexAttribDivisorANGLE"].bind(iArray) : returnFalse;
            gl.hasInstancedArrays = iArray ? returnTrue : returnFalse;
        }
        else
        {
            gl.hasInstancedArrays = returnTrue;
        }

        const anisotropicFilterExt = this.GetExtension("EXT_texture_filter_anisotropic");
        if (anisotropicFilterExt)
        {
            if (this.enableAnisotropicFiltering)
            {
                anisotropicFilterExt.maxAnisotropy = gl.getParameter(anisotropicFilterExt["MAX_TEXTURE_MAX_ANISOTROPY_EXT"]);
            }
            else
            {
                anisotropicFilterExt.maxAnisotropy = 0;
            }
        }

        // CCP mobile shader binary (is this depreciated?)
        const ccpShaderBinary = this.GetExtension("CCP_shader_binary");
        if (ccpShaderBinary)
        {
            const
                renderer = gl.getParameter(this.gl.RENDERER),
                maliVer = renderer.match(/Mali-(\w+).*/);

            if (maliVer)
            {
                this.effectDir = "/effect.gles2.mali" + maliVer[1] + "/";
            }
        }

        // Quality
        this.alphaBlendBackBuffer = params.alpha;
        this.msaaSamples = this.gl.getParameter(this.gl.SAMPLES);
        this.antialiasing = this.msaaSamples > 1;

        this.Resize(true);

        const vertices = [
            1.0, 1.0, 0.0, 1.0, 1.0, 1.0, -1.0, 1.0, 0.0, 1.0, 0.0, 1.0,
            1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, 0.0, 0.0
        ];

        this._quadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._quadBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        this._cameraQuadBuffer = gl.createBuffer();
        this._quadDecl = Tw2VertexDeclaration.from([
            { usage: "POSITION", usageIndex: 0, elements: 4 },
            { usage: "TEXCOORD", usageIndex: 0, elements: 2 }
        ]);

        this._alphaBlendState = {
            dirty: false,
            states: {
                [RS_SRCBLEND]: BLEND_SRCALPHA,
                [RS_DESTBLEND]: BLEND_INVSRCALPHA,
                [RS_BLENDOP]: BLENDOP_ADD,
                [RS_SEPARATEALPHABLENDENABLE]: 0,
                [RS_BLENDOPALPHA]: BLENDOP_ADD,
                [RS_SRCBLENDALPHA]: BLEND_SRCALPHA,
                [RS_DESTBLENDALPHA]: BLEND_INVSRCALPHA,
            }
        };

        this._alphaTestState = {
            dirty: false,
            states: {
                [RS_ALPHATESTENABLE]: 0,
                [RS_ALPHAREF]: -1,
                [RS_ALPHAFUNC]: CMP_GREATER,
                [RS_CLIPPING]: 0,
                [RS_CLIPPLANEENABLE]: 0
            }
        };

        this._depthOffsetState = {
            dirty: false,
            states: {
                [RS_SLOPESCALEDEPTHBIAS]: 0,
                [RS_DEPTHBIAS]: 0
            }
        };

        this._shadowStateBuffer = new Float32Array(24);

        // Event handlers
        this.canvas.addEventListener("webglcontextlost", () =>
        {
            this._contextLost = true;
            this.EmitEvent("context_lost", this);
        });

        this.canvas.addEventListener("webglcontextrestored", () =>
        {
            this._contextLost = false;
            this.EmitEvent("context_restored", this);
        });

    }

    /**
     * Sets the pixel aspect ratio and resizes afterwards
     * @param {Number} value
     */
    SetPixelRatio(value)
    {
        if (this.viewportPixelRatio !== value)
        {
            this.viewportPixelRatio = value;
            this.Resize();
        }
    }

    /**
     * Converts an effect resource path back into a normal effect file path
     * @param {String} path
     * @param {String} [ext='fx']
     * @returns {String}
     */
    FromEffectPath(path, ext = "fx")
    {
        path = path.substr(0, path.lastIndexOf(".")).replace(this.effectDir, "/effect/") + "." + ext;
        return path.toLowerCase();
    }

    /**
     * Translates a path to an
     * @param {String} path
     * @returns {String}
     */
    ToEffectPath(path)
    {
        path = path ? path.substr(0, path.lastIndexOf(".")).replace("/effect/", this.effectDir) + ".sm_" + this.shaderModel : "";
        return path.toLowerCase();
    }

    /**
     * Handles resize events
     * @param  {Boolean} [force]
     * @param {Boolean} [skipCanvas2dClear]
     * @returns  {Boolean} true if updated
     */
    Resize(force, skipCanvas2dClear)
    {
        const
            width = Math.floor(this.canvas.clientWidth * this.viewportPixelRatio),
            height = Math.floor(this.canvas.clientHeight * this.viewportPixelRatio);

        if (!force && width === this.viewportWidth && height === this.viewportHeight)
        {
            return false;
        }

        this.viewportWidth = this.canvas.width = width;
        this.viewportHeight = this.canvas.height = height;
        this.viewportAspect = this.viewportWidth / this.viewportHeight;

        this.tw2.variables.SetValue("ViewportSize", [
            this.viewportWidth,
            this.viewportHeight,
            this.viewportWidth,
            this.viewportHeight
        ]);

        this.EmitEvent("resized", this, {
            width: this.viewportWidth,
            height: this.viewportHeight,
            aspect: this.viewportAspect,
        });

        if (this.canvas2d)
        {
            this.canvas2d.width = width;
            this.canvas2d.height = height;
            if (!skipCanvas2dClear && this.autoClearCanvas2dOnResize)
            {
                this.ClearCanvas2d();
            }
        }

        return true;
    }

    /**
     * Gets the current time
     * @returns {number}
     */
    get now()
    {
        return this._Date.now();
    }

    /**
     * Clears the 2d canvas
     * @param {Boolean} [skipEvent]
     */
    ClearCanvas2d(skipEvent)
    {
        const context = this.canvas2d.getContext("2d");
        context.clearRect(0, 0, this.viewportWidth, this.viewportHeight);
        if (!skipEvent) this.EmitEvent("canvas2d_cleared", context);
    }

    /**
     * Fires on the start of a frame
     */
    Tick()
    {
        let resized = this.Resize(false, true);

        const
            now = this.now,
            previousTime = this.previousTime === null ? now : this.previousTime;

        this.currentTime = (now - this.startTime) * 0.001;
        this.dt = (now - previousTime) * 0.001;
        this.previousTime = now;

        this.tw2.variables.SetValue("Time", [
            this.currentTime,
            this.currentTime - Math.floor(this.currentTime),
            this.frameCounter,
            previousTime * 0.001
        ]);

        this._fpsFrameCount++;
        if (now >= this._fpsPreviousTime + 1000)
        {
            this.fps = Math.floor((this._fpsFrameCount * 1000) / (now - this._fpsPreviousTime));
            this._fpsFrameCount = 0;
            this._fpsPreviousTime = now;
        }

        this.frameCounter++;

        // Auto redraw canvas 2d
        if (this.canvas2d && (this.autoClearCanvas2dPerFrame || resized && this.autoClearCanvas2dOnResize))
        {
            this.ClearCanvas2d();
        }
    }

    /**
     * Sets World transform matrix
     * @param {mat4} matrix
     */
    SetWorld(matrix)
    {
        mat4.copy(this.world, matrix);
    }

    /**
     * Sets view matrix
     * @param {mat4} matrix
     * @param {Boolean} [forceUpdateViewProjection]
     */
    SetView(matrix, forceUpdateViewProjection)
    {
        this._viewProjectionDirty = true;
        mat4.copy(this.view, matrix);
        mat4.invert(this.viewInverse, this.view);
        mat4.transpose(this.viewTranspose, this.view);
        mat4.getTranslation(this.eyePosition, this.viewInverse);
        if (forceUpdateViewProjection) this.UpdateViewProjection();
    }

    /**
     * Sets projection matrix
     * @param {mat4} matrix
     * @param {Boolean} [forceUpdateViewProjection]
     */
    SetProjection(matrix, forceUpdateViewProjection)
    {
        this._viewProjectionDirty = true;
        mat4.copy(this.projection, matrix);
        mat4.transpose(this.projectionTranspose, this.projection);
        mat4.invert(this.projectionInverse, this.projection);
        this.GetTargetResolution(this.targetResolution);
        if (forceUpdateViewProjection) this.UpdateViewProjection();
    }

    /**
     * Updates view projection matrices
     */
    UpdateViewProjection(force)
    {
        if (this._viewProjectionDirty || force)
        {
            mat4.multiply(this.viewProjection, this.projection, this.view);
            mat4.transpose(this.viewProjectionTranspose, this.viewProjection);
            mat4.invert(this.viewProjectionInverse, this.viewProjection);
            this.tw2.variables.SetValue("ViewProjectionMat", this.viewProjection);
            this._viewProjectionDirty = false;
        }
    }

    /**
     * Gets the device's target resolution
     * @param {vec4} [out=vec4.create()]
     * @returns {vec4} out
     */
    GetTargetResolution(out = vec4.create())
    {
        const aspectRatio = this.projection[0] ? this.projection[5] / this.projection[0] : 0.0;
        let aspectAdjustment = 1.0;
        if (aspectRatio > 1.6) aspectAdjustment = aspectRatio / 1.6;
        const fov = 2.0 * Math.atan(aspectAdjustment / this.projection[5]);
        out[0] = this.viewportWidth;
        out[1] = this.viewportHeight;
        out[2] = fov;
        out[3] = fov * aspectRatio;
        return out;
    }

    /**
     * GetEyePosition
     * @param {vec3} [out=vec3.create()]
     * @return {vec3}
     */
    GetEyePosition(out = vec3.create())
    {
        return vec3.copy(out, this.eyePosition);
    }

    /**
     * Returns whether or not Alpha Test is enabled
     * return {Boolean}
     */
    IsAlphaTestEnabled()
    {
        return this._alphaTestState.states[RS_ALPHATESTENABLE];
    }

    /**
     * Checks if a frame buffer is complete
     *
     * @param frameBuffer
     * @returns {Boolean}
     */
    IsFrameBufferComplete(frameBuffer)
    {
        return this.gl.checkFramebufferStatus(frameBuffer) === this.gl.FRAMEBUFFER_COMPLETE;
    }

    /**
     * Gets a gl extension
     * @param {String} extension - The gl extension name
     * @returns {*}
     */
    GetExtension(extension)
    {
        if (!(extension in this._extensions))
        {
            let ext;
            for (let i = 0; i < VendorWebglPrefixes.length; i++)
            {
                ext = this.gl.getExtension(VendorWebglPrefixes[i] + extension);
                if (ext) break;
                ext = null;
            }

            this._extensions[extension] = ext;
        }

        return this._extensions[extension];
    }

    /**
     * Gets a fallback texture
     * @returns {*}
     */
    GetFallbackTexture()
    {
        if (!this._fallbackTexture)
        {
            this._fallbackTexture = this.CreateSolidTexture();
        }
        return this._fallbackTexture;
    }

    /**
     * Gets a fallback cube map
     * @returns {*}
     */
    GetFallbackCubeMap()
    {
        if (!this._fallbackCube)
        {
            this._fallbackCube = this.CreateSolidCube();
        }
        return this._fallbackCube;
    }

    /**
     * Creates a solid colored texture
     * @param {vec4|Array} [rgba] - The colour to create, if omitted defaults to completely transparent
     * @returns {WebGLTexture}
     */
    CreateSolidTexture(rgba = [ 0, 0, 0, 0 ])
    {
        const
            gl = this.gl,
            texture = this.gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(rgba));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }

    /**
     * Creates a solid coloured cube texture
     * @param {vec4|Array} rgba
     * @returns {WebGLTexture}
     */
    CreateSolidCube(rgba = [ 0, 0, 0, 0 ])
    {
        const
            gl = this.gl,
            texture = this.gl.createTexture();

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        for (let j = 0; j < 6; ++j)
        {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + j, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(rgba));
        }
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        //gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
        return texture;
    }

    /**
     * RenderFullScreenQuad
     * @param {Tw2Effect} effect
     * @param {String} technique - Technique name
     * @returns {Boolean}
     */
    RenderFullScreenQuad(effect, technique = effect.defaultTechnique)
    {
        if (!effect || !effect.IsGood()) return false;

        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._quadBuffer);
        for (let pass = 0; pass < effect.GetPassCount(technique); ++pass)
        {
            effect.ApplyPass(technique, pass);
            if (!this._quadDecl.SetDeclaration(this, effect.GetPassInput(technique, pass), 24)) return false;
            this.ApplyShadowState();
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        return true;
    }

    /**
     * Renders a Texture to the screen
     * @param {Tw2TextureRes|Tw2TextureParameter} texture
     * @returns {Boolean}
     */
    RenderTexture(texture)
    {
        if (this._blitEffect === null)
        {
            this._blitEffect = Tw2Effect.from({
                effectFilePath: "cdn:/graphics/effect/managed/space/system/blit.fx",
                textures: {
                    BlitSource: ""
                }
            });
        }

        if (texture.textureRes)
        {
            texture = texture.textureRes;
        }

        this._blitEffect.parameters["BlitSource"].AttachTextureRes(texture);
        return this.RenderFullScreenQuad(this._blitEffect);
    }

    /**
     * RenderCameraSpaceQuad
     * @param {Tw2Effect} effect
     * @param {String} technique - Technique name
     * @returns {Boolean}
     */
    RenderCameraSpaceQuad(effect, technique = effect.defaultTechnique)
    {
        if (!effect || !effect.IsGood()) return false;

        const vertices = new Float32Array([
            1.0, 1.0, 0.0, 1.0, 1.0, 1.0, -1.0, 1.0, 0.0, 1.0, 0.0, 1.0,
            1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, 0.0, 0.0
        ]);

        const projInv = this.projectionInverse;
        for (let i = 0; i < 4; ++i)
        {
            const vec = vertices.subarray(i * 6, i * 6 + 4);
            vec4.transformMat4(vec, vec, projInv);
            vec3.scale(vec, vec, 1 / vec[3]);
            vec[3] = 1;
        }

        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._cameraQuadBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        for (let pass = 0; pass < effect.GetPassCount(technique); ++pass)
        {
            effect.ApplyPass(technique, pass);
            if (!this._quadDecl.SetDeclaration(this, effect.GetPassInput(technique, pass), 24)) return false;
            this.ApplyShadowState();
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        return true;
    }

    /**
     * Set a render state
     * @param state
     * @param value
     */
    SetRenderState(state, value)
    {
        const gl = this.gl;
        this._currentRenderMode = RM_ANY;

        switch (state)
        {
            case RS_ZENABLE:
                if (value)
                {
                    gl.enable(gl.DEPTH_TEST);
                }
                else
                {
                    gl.disable(gl.DEPTH_TEST);
                }
                return;

            case RS_ZWRITEENABLE:
                gl.depthMask(!!value);
                return;

            case RS_ALPHATESTENABLE:
            case RS_ALPHAREF:
            case RS_ALPHAFUNC:
            case RS_CLIPPING:
            case RS_CLIPPLANEENABLE:
                if (this._alphaTestState[state] !== value)
                {
                    this._alphaTestState.states[state] = value;
                    this._alphaTestState.dirty = true;
                }
                return;

            case RS_SRCBLEND:
            case RS_DESTBLEND:
            case RS_BLENDOP:
            case RS_SEPARATEALPHABLENDENABLE:
            case RS_BLENDOPALPHA:
            case RS_SRCBLENDALPHA:
            case RS_DESTBLENDALPHA:
                if (this._alphaBlendState[state] !== value)
                {
                    this._alphaBlendState.states[state] = value;
                    this._alphaBlendState.dirty = true;
                }
                return;

            case RS_CULLMODE:
                switch (value)
                {
                    case CULL_NONE:
                        gl.disable(gl.CULL_FACE);
                        return;

                    case CULL_CW:
                        gl.enable(gl.CULL_FACE);
                        gl.cullFace(gl.FRONT);
                        return;

                    case CULL_CCW:
                        gl.enable(gl.CULL_FACE);
                        gl.cullFace(gl.BACK);
                        return;
                }
                return;

            case RS_ZFUNC:
                gl.depthFunc(0x0200 + value - 1);
                return;

            case RS_ALPHABLENDENABLE:
                if (value) gl.enable(gl.BLEND);
                else gl.disable(gl.BLEND);
                return;

            case RS_COLORWRITEENABLE:
                gl.colorMask((value & 1) !== 0, (value & 2) !== 0, (value & 4) !== 0, (value & 8) !== 0);
                return;

            case RS_SCISSORTESTENABLE:
                if (value) gl.enable(gl.SCISSOR_TEST);
                else gl.disable(gl.SCISSOR_TEST);
                return;

            case RS_SLOPESCALEDEPTHBIAS:
            case RS_DEPTHBIAS:
                value = num.dwordToFloat(value);
                if (this._depthOffsetState[state] !== value)
                {
                    this._depthOffsetState.states[state] = value;
                    this._depthOffsetState.dirty = true;
                }
                return;
        }
    }

    /**
     * ApplyShadowState
     */
    ApplyShadowState()
    {
        const gl = this.gl;

        if (this._alphaBlendState.dirty)
        {
            let blendOp = gl.FUNC_ADD;
            if (this._alphaBlendState.states[RS_BLENDOP] === BLENDOP_SUBTRACT)
            {
                blendOp = gl.FUNC_SUBTRACT;
            }
            else if (this._alphaBlendState.states[RS_BLENDOP] === BLENDOP_REVSUBTRACT)
            {
                blendOp = gl.FUNC_REVERSE_SUBTRACT;
            }

            const
                srcBlend = BlendTable[this._alphaBlendState.states[RS_SRCBLEND]],
                destBlend = BlendTable[this._alphaBlendState.states[RS_DESTBLEND]];

            if (this._alphaBlendState.states[RS_SEPARATEALPHABLENDENABLE])
            {
                let blendOpAlpha = gl.FUNC_ADD;
                if (this._alphaBlendState.states[RS_BLENDOP] === BLENDOP_SUBTRACT)
                {
                    blendOpAlpha = gl.FUNC_SUBTRACT;
                }
                else if (this._alphaBlendState.states[RS_BLENDOP] === BLENDOP_REVSUBTRACT)
                {
                    blendOpAlpha = gl.FUNC_REVERSE_SUBTRACT;
                }

                const
                    srcBlendAlpha = BlendTable[this._alphaBlendState.states[RS_SRCBLENDALPHA]],
                    destBlendAlpha = BlendTable[this._alphaBlendState.states[RS_DESTBLENDALPHA]];

                gl.blendEquationSeparate(blendOp, blendOpAlpha);
                gl.blendFuncSeparate(srcBlend, destBlend, srcBlendAlpha, destBlendAlpha);
            }
            else
            {
                gl.blendEquation(blendOp);
                gl.blendFunc(srcBlend, destBlend);
            }
            this._alphaBlendState.dirty = false;
        }

        if (this._depthOffsetState.dirty)
        {
            gl.polygonOffset(
                this._depthOffsetState.states[RS_SLOPESCALEDEPTHBIAS],
                this._depthOffsetState.states[RS_DEPTHBIAS]);
            this._depthOffsetState.dirty = false;
        }

        let alphaTestFunc,
            invertedAlphaTest,
            alphaTestRef;

        if (this._shadowHandles && this._alphaTestState.states[RS_ALPHATESTENABLE])
        {
            switch (this._alphaTestState.states[RS_ALPHAFUNC])
            {
                case CMP_NEVER:
                    alphaTestFunc = 0;
                    invertedAlphaTest = 1;
                    alphaTestRef = -256;
                    break;

                case CMP_LESS:
                    alphaTestFunc = 0;
                    invertedAlphaTest = -1;
                    alphaTestRef = this._alphaTestState.states[RS_ALPHAREF] - 1;
                    break;

                case CMP_EQUAL:
                    alphaTestFunc = 1;
                    invertedAlphaTest = 0;
                    alphaTestRef = this._alphaTestState.states[RS_ALPHAREF];
                    break;

                case CMP_LEQUAL:
                    alphaTestFunc = 0;
                    invertedAlphaTest = -1;
                    alphaTestRef = this._alphaTestState.states[RS_ALPHAREF];
                    break;

                case CMP_GREATER:
                    alphaTestFunc = 0;
                    invertedAlphaTest = 1;
                    alphaTestRef = -this._alphaTestState.states[RS_ALPHAREF] - 1;
                    break;

                    /*
            case CMP_NOTEQUAL:
                var alphaTestFunc = 1;
                var invertedAlphaTest = 1;
                var alphaTestRef = this._alphaTestState.states[RS_ALPHAREF];
                break;
            */

                case CMP_GREATEREQUAL:
                    alphaTestFunc = 0;
                    invertedAlphaTest = 1;
                    alphaTestRef = -this._alphaTestState.states[RS_ALPHAREF];
                    break;

                default:
                    alphaTestFunc = 0;
                    invertedAlphaTest = 0;
                    alphaTestRef = 1;
                    break;
            }

            const clipPlaneEnable = 0;
            gl.uniform4f(
                this._shadowHandles.shadowStateInt,
                invertedAlphaTest,
                alphaTestRef,
                alphaTestFunc,
                clipPlaneEnable);
            //this._shadowStateBuffers
        }
    }

    /**
     * Render states
     * @type {Object}
     * @private
     */
    _renderStates = null;

    /**
     * Sets a render mode state
     * @param {Number} mode
     * @param {Number} state
     * @param {Number} value
     * @returns {boolean} true if updated
     */
    SetRenderModeState(mode, state, value)
    {
        const rm = this._renderStates[mode];
        if (rm === undefined) throw new Error(`Invalid render mode: ${mode}`);

        let normValue = Number(value);
        if (isNaN(normValue)) throw new Error(`Invalid render state value, expected number: ${value}`);

        if (rm.states[state] !== normValue)
        {
            rm.states[state] = normValue;
            rm.dirty = true;
            return true;
        }
        return false;
    }

    /**
     * Gets a render mode state
     * @param {Number} mode
     * @param {Number} state
     * @returns {undefined|Number}
     */
    GetRenderModeState(mode, state)
    {
        const rm = this._renderStates[mode];
        if (!rm) throw new Error(`Invalid render mode: ${mode}`);
        return rm.states[mode];
    }

    /**
     * Sets a render mode
     * @param {number} renderMode
     */
    SetStandardStates(renderMode)
    {
        if (this._currentRenderMode === renderMode)
        {
            if (renderMode === RM_ANY || !this._renderStates[renderMode].dirty) return;
        }

        this.gl.frontFace(this.gl.CW);

        const mode = this._renderStates[renderMode];
        if (mode)
        {
            for (const key in mode.states)
            {
                if (mode.states.hasOwnProperty(key))
                {
                    this.SetRenderState(Number(key), Number(mode.states[key]));
                }
            }
            mode.dirty = false;
        }
        else
        {
            throw new Error(`Invalid render state: ${renderMode}`);
        }

        this._currentRenderMode = renderMode;
    }

    /**
     * Creates a webgl context
     * @param params
     * @param canvas
     * @returns {null|WebGLRenderingContext|WebGL2RenderingContext}
     * @throws on invalid context
     */
    static CreateContext(params = {}, canvas)
    {
        if (isString(canvas))
        {
            canvas = document.getElementById(canvas);
        }

        if (!canvas)
        {
            canvas = document.createElement("canvas");
        }

        const contextTypes = params.webgl2 ? [ "webgl2", "webgl", "experimental-webgl" ] : [ "webgl", "experimental-webgl" ];

        let context = null;
        for (let contextType of contextTypes)
        {
            context = canvas.getContext(contextType, params);
            if (context) break;
        }

        if (!context)
        {
            throw new ErrWebglContext({ version: params.webgl2 ? 2 : 1 });
        }

        return context;
    }

}

/**
 * Requests an animation frame
 * @param {Function} callback
 */
Tw2Device.RequestAnimationFrame = Tw2Device.prototype.RequestAnimationFrame = (function ()
{
    const request = get(window, VendorRequestAnimationFrame);
    return callback => request(callback);
})();

/**
 * Cancels an animation frame
 * @param {Number} id
 */
Tw2Device.CancelAnimationFrame = Tw2Device.prototype.CancelAnimationFrame = (function ()
{
    const cancel = get(window, VendorCancelAnimationFrame);
    return id => cancel(id);
})();



// Render Modes
Tw2Device.prototype.RM_ANY = RM_ANY;
Tw2Device.prototype.RM_OPAQUE = RM_OPAQUE;
Tw2Device.prototype.RM_DECAL = RM_DECAL;
Tw2Device.prototype.RM_TRANSPARENT = RM_TRANSPARENT;
Tw2Device.prototype.RM_ADDITIVE = RM_ADDITIVE;
Tw2Device.prototype.RM_DEPTH = RM_DEPTH;
Tw2Device.prototype.RM_DISTORTION = RM_DISTORTION;
Tw2Device.prototype.RM_FULLSCREEN = RM_FULLSCREEN;
Tw2Device.prototype.RM_PICKABLE = RM_PICKABLE;


/**
 * Throws when unable to create a webgl context
 */
export class ErrWebglContext extends Tw2Error
{
    constructor(data)
    {
        super(data, "Unable to create webgl context (%version%)");
    }
}
