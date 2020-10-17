import { Tw2EventEmitter } from "../class/Tw2EventEmitter";
import { assignIfExists, isError, isString } from "utils";

/**
 * eventLog
 * @typedef {{}} eventLog
 * @property {String} eventLog.type       - The log's type
 * @property {String} eventLog.name       - The log's name
 * @property {String} eventLog.message    - The log's message
 * @property {String} [eventLog.path]     - optional related resource path
 * @property {String} [eventLog.detail]   - optional extra detail
 * @property {String} [eventLog.time]     - optional time taken
 * @property {Boolean} [eventLog.hide]    - optional visibility
 * @property {Boolean} [eventLog._logged] - Identifies if the log has been logged
 * @property {Error} [eventLog.err]       - Optional error (output to the console)
 * @property {*} [eventLog.data]          - Optional data (output to the console)
 */


export class Tw2Logger extends Tw2EventEmitter
{

    name = "";
    display = true;

    history = 100;
    throttle = 20;

    visible = {
        log: true,
        info: true,
        debug: true,
        warn: true,
        error: true
    };

    _logs = [];
    _throttled = null;
    _debugMode = false;

    /**
     * Sets the debug mode
     * @param {Boolean} bool
     */
    SetDebugMode(bool)
    {
        this._debugMode = true;
    }

    /**
     * Sets the logger's properties
     * @param {*} [opt]
     */
    Register(opt)
    {
        if (!opt) return;
        assignIfExists(this, opt, [ "name", "display", "history", "throttle" ]);
        assignIfExists(this.visible, opt.visible, [ "log", "info", "debug", "warn", "error" ]);
    }

    /**
     * Adds a debug log
     * @param {Object|String} log
     * @return {eventLog}
     */
    Debug(log)
    {
        return this.Add("debug", log);
    }

    /**
     * Adds an info log
     * @param {Object|String} log
     * @return {eventLog}
     */
    Info(log)
    {
        return this.Add("info", log);
    }

    /**
     * Adds a warning log
     * @param {Object|String} log
     * @return {eventLog}
     */
    Warn(log)
    {
        return this.Add("warn", log);
    }

    /**
     * Adds an error log
     * @param {Object|String} log
     * @return {eventLog}
     */
    Error(log)
    {
        return this.Add("error", log);
    }

    /**
     * Adds a general log
     * @param {Object|String} log
     * @return {eventLog}
     */
    Log(log)
    {
        return this.Add("log", log);
    }

    /**
     * Adds an event log and outputs it to the console
     * @param {String} type    - Log type
     * @param {*} log          - The eventLog or error to log
     * @returns {eventLog} log
     */
    Add(type = "log", log)
    {
        if (!log)
        {
            log = { message: "" };
        }
        else if (isString(log))
        {
            log = { message: log };
        }
        else if (isError(log))
        {
            log = { message: log.message, err: log };
        }

        if (log._logged) return log;

        // Normalize logs
        log.type = type.toLowerCase();
        log.name = log.name || "Logger";
        log.message = log.message ? log.message.charAt(0).toUpperCase() + log.message.substring(1) : "";

        if (!Tw2Logger.LogType[log.type.toUpperCase()])
        {
            log.type = "log";
        }

        // Set visibility
        if (!this.display || !this.visible[log.type])
        {
            log.hide = true;
        }

        // Throttle excessive output
        if (!this.throttle || this._debugMode)
        {
            this._throttled = null;
        }
        else
        {
            if (!log.hide)
            {
                if (!this._throttled) this._throttled = {};
                if (!this._throttled[log.type]) this._throttled[log.type] = [];
                const t = this._throttled[log.type];
                if (!t.includes(log.message))
                {
                    t.unshift(log.message);
                    t.splice(this.throttle);
                }
                else
                {
                    log.hide = true;
                }
            }
        }

        // Output to the console
        if (!log.hide || this._debugMode)
        {
            // Optional details
            let subMessage = "";
            if (log.path && !log.message.includes(log.path)) subMessage += `'${log.path}' `;
            if (log.time) subMessage += `in ${log.time.toFixed(3)} secs `;
            if (log.detail) subMessage += `(${log.detail}) `;

            let header = `${this.name} ${log.name}:`;
            if (log.err || log.data)
            {
                console.group(header, log.message, subMessage);
                if (log.err) console.error(log.err.stack || log.err.toString());
                if (log.data) console.debug(JSON.stringify(log.data, null, 4));
                console.groupEnd();
            }
            else
            {
                console[log.type](header, log.message, subMessage);
            }
        }

        // Manage log history
        const logsToKeep = this._debugMode ? 1000 : this.history;
        if (logsToKeep)
        {
            this._logs.unshift(log);
            this._logs.splice(logsToKeep);
        }
        else
        {
            this._logs = [];
        }

        log._logged = true;

        this.EmitEvent(log.type, log);
        return log;
    }

    /**
     * Log types
     * @type {*}
     */
    static LogType = {
        ERROR: "error",
        WARNING: "warn",
        WARN: "warn",
        INFO: "info",
        LOG: "log",
        DEBUG: "debug"
    };

}
