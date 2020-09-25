import { vec2, vec3, vec4, mat4, tw2 } from "global";
import { ErrBinaryReaderReadError, ErrFeatureNotImplemented } from "../Tw2Error";
import { getMetadata, hasMetadata, isFunction, isPlain, isString } from "global/util";

import { Type } from "global/engine/Tw2Constant";

const TypeReader = {
    [Type.UNKNOWN]: notImplemented,
    [Type.BOOLEAN]: boolean,
    [Type.PATH]: path,
    [Type.STRING]: string,
    [Type.BYTE]: byte,
    [Type.UINT]: uint,
    [Type.USHORT]: ushort,
    [Type.FLOAT]: float,
    [Type.VECTOR2]: vector2,
    [Type.VECTOR3]: vector3,
    [Type.VECTOR4]: vector4,
    [Type.QUATERNION]: vector4,
    [Type.MATRIX4]: matrix,
    [Type.COLOR]: color,
    [Type.OBJECT]: object,
    [Type.RAW]: rawObject,
    [Type.LIST]: array,
    [Type.ARRAY]: array,
    [Type.PLAIN]: rawObject,
    [Type.INDEX_BUFFER]: indexBuffer,
    [Type.ENUM]: enums
};


/**
 * Reads objects
 * @param {Tw2BlackBinaryReader} reader
 * @param {undefined|Number} [id]
 * @returns {*|Object} out
 */
export function object(reader, id)
{
    const
        context = reader.context,
        givenId = id !== undefined,
        debugEnabled = tw2.constructor.DEBUG_ENABLED;

    if (!givenId)
    {
        id = reader.ReadU32();

        if (id === 0)
        {
            return null;
        }
        else if (reader.references.has(id))
        {
            return reader.references.get(id);
        }
    }

    const
        objectReader = reader.ReadBinaryReader(reader.ReadU32()),
        type = objectReader.ReadStringU16(),
        result = context.ConstructType(type),
        blackReaders = result.constructor.blackReaders || {};

    if (!givenId)
    {
        reader.references.set(id, result);
    }

    while (!objectReader.AtEnd())
    {
        let propertyName = objectReader.ReadStringU16(),
            reader;

        // Defined directly on class
        if (blackReaders[propertyName])
        {
            reader = blackReaders[propertyName];
        }
        // Defined as black meta data
        else if (hasMetadata("black", result, propertyName))
        {
            reader = getMetadata("black", result, propertyName);
        }
        // Use property type meta data
        else if (hasMetadata("type", result, propertyName))
        {
            const propertyType = Number(getMetadata("type", result, propertyName));
            reader = TypeReader[propertyType];
        }

        if (!reader)
        {
            if (debugEnabled) console.dir(result);
            throw new ErrBinaryReaderReadError({ readError: `Unknown property "${propertyName}" for "${type}"` });
        }

        if (!isFunction(reader))
        {
            if (debugEnabled) console.dir(result);
            throw new ErrBinaryReaderReadError({ readError: `Invalid reader for property "${propertyName}" for "${type}"` });
        }

        try
        {
            if (reader.custom)
            {
                reader(objectReader, result, propertyName);
            }
            else
            {
                // Ensure property is defined on object
                if (!(propertyName in result) && debugEnabled)
                {
                    console.log(`'${type}' missing property: '${propertyName}'`);
                }

                result[propertyName] = reader(objectReader);
            }
        }
        catch (err)
        {
            if (debugEnabled) console.dir(result);
            throw new ErrBinaryReaderReadError({ message: `${propertyName} (${result.constructor.name}) > ` + err.message });
        }
    }

    objectReader.ExpectEnd("object did not read to end");

    if ("Initialize" in result)
    {
        result.Initialize();
    }

    return result;
}

/**
 * Reads a rawObject object
 * @param {Tw2BlackBinaryReader} reader
 * @returns {Object} out
 */
export function rawObject(reader)
{
    return object(reader, null);
}

/**
 * Reads an array
 * @param {Tw2BlackBinaryReader} reader
 * @returns {Array} out
 */
export function array(reader)
{
    const
        result = [],
        count = reader.ReadU32();

    for (let i = 0; i < count; i++)
    {
        result[i] = object(reader);
    }
    return result;
}

/**
 * Reads a boolean
 * @param {Tw2BlackBinaryReader} reader
 * @returns {Boolean}
 */
export function boolean(reader)
{
    return reader.ReadU8() !== 0;
}

/**
 * Reads a string
 * @param {Tw2BlackBinaryReader} reader
 * @returns {String}
 */
export function string(reader)
{
    return reader.ReadStringU16();
}


/**
 * Reads a path
 * @param {Tw2BlackBinaryReader} reader
 * @returns {String}
 */
export function path(reader)
{
    const result = reader.ReadStringU16();
    return path.handler ? path.handler(result) : result;
}

/**
 * Path handler
 * @type {null|Function}
 */
path.handler = null;

/**
 * Creates an enum object from a string
 * @param {Tw2BlackReader} reader
 * @returns {Object}
 */
export function enums(reader)
{
    const
        value = reader.ReadStringU16(),
        entry = value.split(","),
        out = {};

    for (let i = 0; i < entry.length; i++)
    {
        const split = entry[i].split("=");
        out[split[0]] = Number(split[1]);
    }

    return out;
}

/**
 * Reads a float
 * @param {Tw2BlackBinaryReader} reader
 * @returns {Number}
 */
export function float(reader)
{
    return reader.ReadF32();
}

/**
 * Reads a ushort
 * @param {Tw2BlackBinaryReader} reader
 * @returns {Number}
 */
export function ushort(reader)
{
    return reader.ReadU16();
}

/**
 * Reads a uint
 * @param {Tw2BlackBinaryReader} reader
 * @returns {Number}
 */
export function uint(reader)
{
    return reader.ReadU32();
}

/**
 * Reads a byte
 * @param {Tw2BlackBinaryReader} reader
 * @returns {Number}
 */
export function byte(reader)
{
    return reader.ReadU8();
}

/**
 * Reads a vector2
 * @param {Tw2BlackBinaryReader} reader
 * @returns {vec2}
 */
export function vector2(reader)
{
    return vec2.fromValues(reader.ReadF32(), reader.ReadF32());
}

/**
 * Reads a vector3
 * @param {Tw2BlackBinaryReader} reader
 * @returns {vec3}
 */
export function vector3(reader)
{
    return vec3.fromValues(reader.ReadF32(), reader.ReadF32(), reader.ReadF32());
}

/**
 * Reads a color
 * @param {Tw2BlackBinaryReader} reader
 * @returns {vec4}
 */
export function color(reader)
{
    return vec4.fromValues(reader.ReadF32(), reader.ReadF32(), reader.ReadF32(), reader.ReadF32());
}

/**
 * Reads a vector4
 * @param {Tw2BlackBinaryReader} reader
 * @returns {vec4}
 */
export function vector4(reader)
{
    return vec4.fromValues(reader.ReadF32(), reader.ReadF32(), reader.ReadF32(), reader.ReadF32());
}

/**
 * Reads a matrix with 16 elements
 * @param {Tw2BlackBinaryReader} reader
 * @returns {mat4}
 */
export function matrix(reader)
{
    return mat4.fromValues(
        reader.ReadF32(), reader.ReadF32(), reader.ReadF32(), reader.ReadF32(),
        reader.ReadF32(), reader.ReadF32(), reader.ReadF32(), reader.ReadF32(),
        reader.ReadF32(), reader.ReadF32(), reader.ReadF32(), reader.ReadF32(),
        reader.ReadF32(), reader.ReadF32(), reader.ReadF32(), reader.ReadF32()
    );
}

/**
 * Reads an index buffer
 * @param {Tw2BlackBinaryReader} reader
 * @returns {Uint32Array}
 */
export function indexBuffer(reader)
{
    const
        count = reader.ReadU32(),
        byteSize = reader.ReadU16();

    if (byteSize === 4)
    {
        return reader.ReadU32Array(count);
    }
    else
    {
        throw "unsupported for now";
    }
}

/**
 * Reads a struct
 * @param {*} struct
 * @returns {Function}
 */
export function struct(struct)
{
    return function(reader)
    {
        return struct.blackStruct(reader);
    };
}

/**
 * Reads a struct list
 * @param {*} struct
 * @returns {Function}
 */
export function structList(struct)
{
    return function(reader)
    {
        let
            count = reader.ReadU32(),
            byteSize = reader.ReadU16(),
            result = [];

        for (let i = 0; i < count; i++)
        {
            const structReader = reader.ReadBinaryReader(byteSize);
            result[i] = struct.blackStruct(structReader);
            structReader.ExpectEnd("struct read to end");
        }

        return result;
    };
}


/**
 * Gets a plain object from an array, using the supplied key as the property for each item
 * @param {String|Object} options
 * @param {String} options.key         - The element key to use as a property key
 * @param {?Function} [options.struct] - The optional struct to use (will use array reader by default)
 * @param {?String} [options.reroute]  - The optional property to reroute the results to
 * @param {?String} [options.value]    - Sets the object value as one of the item's values instead of the item
 * @returns {function(*=)}
 */
export function fromList(options)
{
    if (isString(options))
    {
        options = { key: options };
    }

    const { key, struct, reroute, value } = options;

    const handler = function(reader, parent, property)
    {
        // Allows rerouting of results to a new target property
        const target = parent[reroute ? reroute : property];

        // Target must be a plain object
        if (!isPlain(target))
        {
            throw new Error("Target is not a plain object");
        }

        const result = struct ? structList(struct)(reader) : array(reader);
        for (let i = 0; i < result.length; i++)
        {
            const
                item = result[i],
                prop = result[i][key];

            if (prop === undefined)
            {
                throw new Error(`Array element property is undefined: ${key}`);
            }

            if (prop in target)
            {
                console.warn(`Property '${prop}' already defined`);
            }

            if (value === undefined)
            {
                target[prop] = item;
            }
            else
            {
                // Return one of the item's property values instead of the whole item
                if (value in item)
                {
                    target[prop] = item[value];
                }
                else
                {
                    throw new Error(`Property is undefined: ${value}`);
                }
            }
        }
    };

    handler.custom = true;

    return handler;
}

/**
 * Throws an error when the reader is called
 * @param {Tw2BlackBinaryReader} reader
 * @param {*} target
 * @param {String} property
 */
export function notImplemented(reader, target, property)
{
    throw new ErrFeatureNotImplemented({ feature: `Black reader for property '${property}'` });
}

notImplemented.custom = true;
