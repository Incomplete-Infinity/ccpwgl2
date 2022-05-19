import { isTyped, isArrayLike, isArray, isPlain } from "./type";
import { toArray } from "utils/arr";

/**
 * Gets a random object element
 * @param {Object} obj
 * @returns {Array}
 */
export function getRandomObjectElement(obj)
{
    let key;

    if (Array.isArray(obj))
    {
        key = Math.floor(Math.random() * (obj.length));
    }
    else
    {
        const keys = Object.keys(obj);
        key = keys[Math.floor(Math.random() * keys.length)];
    }

    return [ obj[key], key ];
}

/**
 * Empties an array or plain object
 * @param {Array|Object} obj
 * @return {Array|Object} obj
 */
export function emptyObject(obj)
{
    if (isArray(obj))
    {
        obj.splice(0);
        return obj;
    }

    if (isPlain(obj))
    {
        for (const key in obj)
        {
            if (obj.hasOwnProperty(key))
            {
                Reflect.deleteProperty(obj, key);
            }
        }
        return obj;
    }

    throw new ReferenceError("Invalid object, expected array or plain object");
}

/**
 * Assigns property values if they exist in a source object
 * - Typed arrays are cloned/ copied to ensure no pass-by-reference errors
 *
 * @param {*} dest
 * @param {*} src
 * @param {string[]} attrs
 * @param {Boolean} [skipIfDestUndefined] - Skips assignment if the destination doesn't have the value
 * @returns {boolean} true if something was assigned
 */
export function assignIfExists(dest, src, attrs, skipIfDestUndefined)
{
    if (!src) return false;

    attrs = toArray(attrs);

    let assigned = false;
    for (let i = 0; i < attrs.length; i++)
    {
        const attr = attrs[i];

        let srcAttr = attr,
            destAttr = attr;

        if (isArray(attr))
        {
            srcAttr = attr[1];
            destAttr = attr[0];
        }

        if (src[srcAttr] === undefined)
        {
            continue;
        }

        if (skipIfDestUndefined && dest[destAttr] === undefined)
        {
            continue;
        }

        if (isArrayLike(dest[destAttr]))
        {
            if (isTyped(dest[destAttr]))
            {
                if (dest[destAttr].length !== src[srcAttr].length)
                {
                    const Constructor = dest[destAttr].constructor;
                    dest[destAttr] = new Constructor(src[srcAttr]);
                }
                else
                {
                    dest[destAttr].set(src[srcAttr]);
                }
            }
            else
            {
                dest[destAttr].splice(0);
                for (let i = 0; i < src[srcAttr].length; i++)
                {
                    dest[destAttr].push(src[srcAttr][i]);
                }
            }
        }
        else if (isTyped(src[srcAttr]))
        {
            const Constructor = src[srcAttr].constructor;
            dest[destAttr] = new Constructor(src[srcAttr]);
        }
        else
        {
            dest[destAttr] = src[srcAttr];
        }

        assigned = true;
    }

    return assigned;
}

/**
 * Gets a source's property value if it exists else returns a default value
 * @param {*} src
 * @param {String|string[]} prop
 * @param {*} [defaultValue]
 * @returns {*}
 */
export function get(src, prop, defaultValue)
{
    if (!isArray(prop))
    {
        return src[prop] !== undefined ? src[prop] : defaultValue;
    }

    for (let i = 0; i < prop.length; i++)
    {
        if (src[prop[i]] !== undefined)
        {
            return src[prop[i]];
        }
    }
    return defaultValue;
}

/**
 * Returns a string from a string template and a given object's properties
 * - templates are surrounded by %'s (ie. %propertyName%)
 * - default values are optionally identified with an = (ie. %propertyName=defaultValue%)
 * @param {String} str
 * @param {{}} [obj={}]
 * @returns {String}
 *
 * @example
 * const message = "%feature=Feature% not supported";
 * const message2 = "%feature% not supported";
 * let str1 = template(message, { feature: "Dynamic resource paths" })
 * let str2 = template(message);
 * let str3 = template(message2);
 * > str1 === "Dynamic resource paths not supported"
 * > str2 === "Feature not supported"
 * > str3 === "undefined not supported"
 */
export function template(str, obj = {})
{
    const literals = str.match(/%([^%]+)?%/g) || [];

    for (let i = 0; i < literals.length; i++)
    {
        const
            literal = literals[i],
            split = literal.substring(1, literal.length - 1).split("="),
            value = split[0] in obj ? obj[split[0]] : split[1];

        str = str.replace(literal, value);
    }

    return str;
}

/**
 * Gets an object's key from a value
 * @param {Object} obj
 * @param {*} value
 * @param {*} [defaultValue]
 * @returns {string}
 */
export function getKeyFromValue(obj, value, defaultValue)
{
    for (const key in obj)
    {
        if (obj.hasOwnProperty(key))
        {
            if (obj[key] === value)
            {
                return key;
            }
        }
    }

    return defaultValue;
}

/**
 * Create an object composed of the picked object properties
 * @param {Object} object
 * @param {string[]} keys
 * @returns {Object}
 */
export function pick(object, keys)
{
    return keys.reduce((obj, key) =>
    {
        if (object && Object.prototype.hasOwnProperty.call(object, key))
        {
            obj[key] = object[key];
        }
        return obj;
    }, {});
}

/**
 * Downloads an object as a json file
 * @param {Object} exportObj
 * @param {String} exportName
 */
export function downloadObjectAsJson(exportObj, exportName)
{
    const
        dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj)),
        downloadAnchorNode = document.createElement("a");

    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}
