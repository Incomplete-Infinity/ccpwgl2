import { Tw2MotherLode } from "./Tw2MotherLode";
import { Tw2LoadingObject } from "../resource/Tw2LoadingObject";
import { Tw2GeometryRes } from "../resource/Tw2GeometryRes";
import { Tw2EventEmitter } from "../Tw2EventEmitter";
import { Tw2Error, ErrFeatureNotImplemented } from "../Tw2Error";
import { assignIfExists, getPathExtension, isBoolean, isError, isFunction } from "utils";



export class Tw2ResMan extends Tw2EventEmitter
{

    motherLode = new Tw2MotherLode();
    maxPrepareTime = 0.05;
    autoPurgeResources = true;
    activeFrame = 0;
    purgeTime = 30;

    maxWatchedUpdateTime = 0.05;
    maxWatchedCount = 0;
    maxWatchedTime = 240;

    _prepareBudget = 0;
    _prepareQueue = [];
    _purgeTime = 0;
    _purgeFrame = 0;
    _purgeFrameLimit = 1000;
    _pendingLoads = [];
    _noLoadFrames = 0;
    _systemMirror = false;

    /**
     * Sets system mirror
     * @param {Boolean} bool
     */
    set systemMirror(bool)
    {
        this._systemMirror = !!bool;
        const geometries = this.motherLode.Filter((key, object) => object instanceof Tw2GeometryRes ? object : null);
        for (let i = 0; i < geometries.length; i++)
        {
            geometries[i].systemMirror = this._systemMirror;
        }
    }

    /**
     * Gets system mirror status
     * @returns {boolean}
     */
    get systemMirror()
    {
        return this._systemMirror;
    }

    /**
     * Gets a count of pending loads
     * @returns {number}
     */
    get pendingLoads()
    {
        return this._pendingLoads.length;
    }

    /**
     * Constructor
     * @param {Tw2Library} tw2
     */
    constructor(tw2)
    {
        super();
        this.tw2 = tw2;
    }

    /**
     * Sets resource manager options
     * @param {*} [opt]
     */
    Register(opt)
    {
        if (!opt) return;

        if ("events" in opt) this.AddEvents(opt.events);

        assignIfExists(this, opt, [
            "systemMirror",
            "maxPrepareTime",
            "autoPurgeResources",
            "purgeTime",
            "maxWatchedTime",
            "maxWatchedCount",
            "maxWatchedUpdateTime"
        ]);
    }

    /**
     * Sets debug mode
     * @param {Boolean} bool
     */
    SetDebugMode(bool)
    {
        // If debug is true, turn system mirror on
        if (bool)
        {
            this.systemMirror = bool;
        }
    }

    /**
     * Gets the current debug mode
     * @param {Boolean} bool
     * @return {boolean}
     */
    GetDebugMode(bool)
    {
        return this.systemMirror;
    }

    /**
     * Watches an object and resolves when all of it's resources have completed processing
     * @param {*} object
     * @param {Function} [onProgress]
     * @return {Promise<*>}
     */
    async Watch(object, onProgress)
    {
        return this.motherLode.Watch(object, onProgress);
    }

    /**
     * Unwatches an object and forces its promise to resolve
     * @param {*}  object
     * @return {boolean}
     */
    UnWatch(object)
    {
        return this.motherLode.UnWatch(object);
    }

    /**
     * Purges all watches objects and forces their promises to resolve
     */
    PurgeWatched()
    {
        return this.motherLode.PurgeWatched();
    }

    /**
     * Fires on resource errors
     * - Used when a resource can only be identified by it's path
     * @param {String} path
     * @param {Error} err
     * @returns {Error} err
     */
    OnPathError(path, err = new Tw2Error({ path }))
    {
        path = Tw2ResMan.NormalizePath(path);
        const res = this.motherLode.Find(path);
        if (res) return res.OnError(err);

        this.OnPathEvent(path, "error", err);
        return err;
    }

    /**
     * Fires on path events
     * @param {String} path      - Resource path
     * @param {String} eventName - Resource state name
     * @param {*} [log={}]       - Resource log
     */
    OnPathEvent(path, eventName, log = {})
    {
        const
            res = this.motherLode.Find(path),
            err = isError(log) ? log : undefined;

        if (err)
        {
            this.motherLode.AddError(path, err);
            log = { err, message: err.message };
        }

        log.path = path;
        log.message = log.message || eventName;
        log.name = "Resource manager";

        this.EmitEvent(eventName, path, res, err);
        this.tw2.logger.Add(Tw2ResMan.LogType[eventName.toUpperCase()], log);
    }

    /**
     * IsLoading
     * @returns {Boolean}
     *
     */
    IsLoading()
    {
        return this._noLoadFrames < 2;
    }

    /**
     * Clears the motherLode {@link Tw2MotherLode}
     * @param {Function} [onClear] - An optional function which is called on each cleared resource
     */
    Clear(onClear)
    {
        this.motherLode.Clear(onClear);
    }

    /**
     * Unloads and Clears the motherLode {@link Tw2MotherLode}
     * @param {Function} [onClear] - An optional function which is called on each cleared resource
     * @param {eventLog} [eventLog]
     */
    UnloadAndClear(onClear, eventLog)
    {
        this.motherLode.UnloadAndClear(onClear, eventLog);
    }

    /**
     * Internal update function. It is called every frame.
     * @returns {Boolean}
     */
    Tick()
    {
        if (this._prepareQueue.length === 0 && this._pendingLoads.length === 0)
        {
            if (this._noLoadFrames < 2)
            {
                this._noLoadFrames++;
            }
        }
        else
        {
            this._noLoadFrames = 0;
        }

        this._prepareBudget = this.maxPrepareTime;

        const startTime = this.tw2.now;
        while (this._prepareQueue.length)
        {
            const [ res, data, xml ] = this._prepareQueue[0];

            this._prepareQueue.shift();

            try
            {
                res.Prepare(data, xml);
                this._prepareBudget -= (this.tw2.now - startTime) * 0.001;
                if (this._prepareBudget < 0) break;
            }
            catch (err)
            {
                this._prepareBudget = 0;
                res.OnError(err);
            }
        }

        this.motherLode.UpdateWatched(this.maxWatchedUpdateTime, this.maxWatchedCount, this.maxWatchedTime);

        this._purgeTime += this.tw2.dt;

        if (this._purgeTime > 1)
        {
            this.activeFrame += 1;
            this._purgeTime -= Math.floor(this._purgeTime);
            this._purgeFrame += 1;

            if (this._purgeFrame >= 5)
            {
                if (this.autoPurgeResources)
                {
                    this.motherLode.PurgeInactive(this._purgeFrame, this._purgeFrameLimit, this.purgeTime);
                }
            }
        }

        return true;
    }

    /**
     * Adds a resource and response to the prepare queue
     * @param {Tw2Resource} res
     * @param {*} response
     * @param {*} [meta]
     */
    Queue(res, response, meta)
    {
        this._prepareQueue.push([ res, response, meta ]);
    }

    /**
     * Gets a resource
     * @param {String} path           - The path to load
     * @param {Function} [onResolved] - Callback fired when the object has loaded
     * @param {Function} [onRejected] - Callback fired when the object fails to load
     * @returns {Tw2Resource|*} resource
     */
    GetResource(path, onResolved, onRejected)
    {
        let res;
        path = Tw2ResMan.NormalizePath(path);

        // TODO: Dynamic resources
        if (path.indexOf("dynamic:/") === 0)
        {
            throw new ErrFeatureNotImplemented({ feature: "Dynamic resources" });
        }

        // Check if already loaded
        res = this.motherLode.Find(path);
        if (res)
        {
            res.RegisterCallbacks(onResolved, onRejected);
            return res;
        }

        // Manually created resources
        if (path.indexOf("manual:/") === 0)
        {
            throw new ErrFeatureNotImplemented({ feature: "Manually created resource" });
        }

        try
        {
            const Constructor = this.tw2.GetExtensionFromPath(path);
            res = new Constructor();
        }
        catch (err)
        {
            this.OnPathError(path, err);
            if (onRejected) onRejected(err);
            return null;
        }

        res.path = path;
        res.RegisterCallbacks(onResolved, onRejected);
        return this.LoadResource(res);
    }

    /**
     * Fetches a resource
     * @param {String} path
     * @returns {Promise<Tw2Resource|null>}
     */
    async FetchResource(path)
    {
        return new Promise((resolve, reject) =>
        {
            this.GetResource(path, resolve, reject);
        });
    }

    /**
     * Gets a resource object
     * @param {String} path           - The path to load
     * @param {Function} [onResolved] - Callback fired when the object has loaded
     * @param {Function} [onRejected] - Callback fired when the object fails to load
     */
    GetObject(path, onResolved, onRejected)
    {
        path = Tw2ResMan.NormalizePath(path);

        // Check if already loaded
        let res = this.motherLode.Find(path);
        if (res)
        {
            res.AddObject(onResolved, onRejected);
            return;
        }

        res = new Tw2LoadingObject();
        res.path = path;
        res.AddObject(onResolved, onRejected);
        this.LoadResource(res);
    }

    /**
     * Fetches an object
     * @param {String} path
     * @returns {Promise<any>}
     */
    async FetchObject(path)
    {
        return new Promise((resolve, reject) =>
        {
            this.GetObject(path, resolve, reject);
        });
    }

    /**
     * Loads a resource
     * TODO: Create a res object for each quality level rather than just one
     * @param {Tw2Resource|*} res
     * @param {eventLog} [eventLog]
     */
    LoadResource(res, eventLog)
    {
        this.motherLode.Add(res.path, res);

        // Don't load if already errored
        if (res.HasErrored())
        {
            return res;
        }

        try
        {
            const url = this.tw2.GetURL(res.path);

            res.OnRequested(eventLog);

            if (res.DoCustomLoad && res.DoCustomLoad(url, getPathExtension(url)))
            {
                return res;
            }

            if (res.HasErrored())
            {
                return res;
            }

            this.Fetch(url, res.requestResponseType)
                .then(response =>
                {
                    res.OnLoaded();
                    this.Queue(res, response);
                })
                .catch(err =>
                {
                    res.OnError(err);
                });
        }
        catch (err)
        {
            res.OnError(err);
        }

        return res;
    }

    /**
     * Adds a pending url
     * @param {String} url
     */
    AddPendingLoad(url)
    {
        this._pendingLoads.push(url);
    }

    /**
     * Removes a pending url
     * @param {String} url
     */
    RemovePendingLoad(url)
    {
        const index = this._pendingLoads.indexOf(url);
        if (index !== -1)
        {
            this._pendingLoads.splice(index, 1);
        }
    }

    /**
     * Fetches cache
     * @param {String} url
     * @param {String|Function} responseType
     * @returns {Promise}
     */
    async Fetch(url, responseType)
    {
        this.AddPendingLoad(url);

        return fetch(url)
            .then(response =>
            {
                if (!response.ok)
                {
                    throw response;
                }

                if (isFunction(responseType))
                {
                    return responseType(response);
                }

                switch (responseType)
                {
                    case "arraybuffer":
                        return response.arrayBuffer();

                    case "text":
                        return response.text();

                    case "json":
                        return response.json();

                    case "blob":
                        return response.blob();

                    default:
                        throw new Error("Invalid fetch type: " + responseType);
                }
            })
            .then(result =>
            {
                this.RemovePendingLoad(url);
                return result;
            })
            .catch(err =>
            {
                this.RemovePendingLoad(url);

                if (err.text)
                {
                    return err.text()
                        .then(text =>
                        {
                            let { status, statusText } = err;
                            let json;

                            try
                            {
                                json = JSON.parse(text);
                                statusText = json.message || json.msg || json.error || json.err;
                                if (isBoolean(statusText)) statusText = undefined;
                            }
                            catch (err)
                            {
                                statusText = "Failed to fetch resource";
                            }

                            throw new ErrHTTPStatus({ status, statusText, json });
                        });
                }
                else
                {
                    throw err;
                }
            });
    }

    /**
     * Builds a url from a resource path
     * @param {String} path
     * @returns {String}
     * @throws {ErrStoreKeyUnregistered} When passed a url with an unregistered resource prefix
     */
    BuildUrl(path)
    {
        return this.tw2.GetURL(path);
    }

    /**
     * Normalizes a file path by making it lower case and replaces all '\\' with '/'
     * @param {String} path
     * @returns {String}
     */
    static NormalizePath(path)
    {
        path = path.toLowerCase();
        path = path.replace("\\", "/");
        return path;
    }

    /**
     * Log type
     * @type {*}
     */
    static LogType = {
        ERROR: "error",
        PURGED: "info",
        UNLOADED: "info",
        REQUESTED: "info",
        RELOADING: "info",
        LOADED: "info",
        PREPARED: "log",
        WARNING: "warn",
        DEBUG: "debug"
    };

}

/**
 * Throws on http request errors
 */
export class ErrHTTPRequest extends Tw2Error
{
    constructor(data)
    {
        super(data, "Communication error while requesting resource");
    }
}

/**
 * Throws on http status errors
 */
export class ErrHTTPStatus extends Tw2Error
{
    constructor(data)
    {
        super(data, "%statusText=Communication status error while loading resource% (%status%)");
    }
}
