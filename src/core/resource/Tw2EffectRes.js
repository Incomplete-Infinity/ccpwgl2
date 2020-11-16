import { meta } from "utils";
import { Tw2BinaryReader } from "../reader";
import { Tw2Resource } from "./Tw2Resource";
import { Tw2Shader, Tw2ShaderPermutation } from "../shader";
import { Tw2Error } from "../Tw2Error";


@meta.type("Tw2EffectRes")
export class Tw2EffectRes extends Tw2Resource
{

    passes = [];
    annotations = {};
    permutations = [];
    offsets = [];
    reader = null;
    version = 0;
    stringTable = "";
    shaders = {};

    ReadString = null;
    validShadowShader = false;

    _requestResponseType = "arraybuffer";


    /**
     * Prepares the effect
     * - Creates Shaders
     * - Sets shadow states for shaders
     * - Parses Jessica shader annotations
     * @param data
     */
    Prepare(data)
    {
        this.permutations = [];
        this.offsets = [];
        this.passes = [];
        this.annotations = {};
        this.reader = null;
        this.version = 0;
        this.stringTable = "";
        this.shaders = {};

        const reader = this.reader = new Tw2BinaryReader(new Uint8Array(data));

        const version = reader.ReadUInt32();
        if (version < 2 || version > 8)
        {
            this.OnError(new ErrShaderVersion({ path: this.path, version }));
            return;
        }

        /**
         * ReadString
         * @returns {String}
         */
        this.ReadString = function()
        {
            const offset = reader.ReadUInt32();
            let end = offset;
            while (stringTable.charCodeAt(end))
            {
                ++end;
            }
            return stringTable.substr(offset, end - offset);
        };

        let headerSize,
            stringTableSize,
            stringTable;

        if (version < 5)
        {
            headerSize = reader.ReadUInt32();
            if (headerSize === 0)
            {
                this.OnError(new ErrShaderHeaderSize({ path: this.path }));
                return;
            }

            /* let permutation = */
            reader.ReadUInt32();
            const offset = reader.ReadUInt32();
            reader.cursor = 2 * 4 + headerSize * 3 * 4;
            stringTableSize = reader.ReadUInt32();
            this.stringTableOffset = reader.cursor;
            stringTable = String.fromCharCode.apply(null, reader.data.subarray(reader.cursor, reader.cursor + stringTableSize));
            reader.cursor = offset;
        }
        else
        {
            stringTableSize = reader.ReadUInt32();
            this.stringTableOffset = reader.cursor;
            stringTable = String.fromCharCode.apply(null, reader.data.subarray(reader.cursor, reader.cursor + stringTableSize));
            reader.cursor += stringTableSize;

            const permutationCount = reader.ReadUInt8();
            for (let perm = 0; perm < permutationCount; ++perm)
            {
                const permutation = Tw2ShaderPermutation.ReadCCPBinary(reader, this);
                this.permutations.push(permutation);
            }

            headerSize = reader.ReadUInt32();
            if (headerSize === 0)
            {
                this.OnError(new ErrShaderHeaderSize({ path: this.path }));
                return;
            }

            for (let i = 0; i < headerSize; ++i)
            {
                this.offsets.push({
                    index: reader.ReadUInt32(),
                    offset: reader.ReadUInt32(),
                    size: reader.ReadUInt32()
                });
            }

            reader.ReadUInt32();
            reader.cursor = reader.ReadUInt32();
        }


        this.reader = reader;
        this.version = version;
        this.stringTable = stringTable;

        this.OnPrepared();
    }

    /**
     * Gets/creates a shader for the given permutation options
     *
     * @param {Object.<string, string>} options - Permutation options
     * @returns {Tw2Shader|null}
     */
    GetShader(options)
    {
        if (!this.IsGood())
        {
            return null;
        }

        let index = 0;
        let multiplier = 1;

        for (let i = 0; i < this.permutations.length; ++i)
        {
            let permutation = this.permutations[i];
            let value = permutation.defaultOption;

            if (options.hasOwnProperty(permutation.name))
            {
                try
                {
                    value = permutation.GetOption(value);
                }
                catch(err)
                {
                    this.OnError(err);
                    return null;
                }
            }

            index += value * multiplier;
            multiplier *= permutation.optionCount;
        }

        if (this.shaders.hasOwnProperty(index))
        {
            return this.shaders[index];
        }

        if (this.version > 4)
        {
            this.reader.cursor = this.offsets[index].offset;
        }

        let shader = null;
        try
        {
            shader = Tw2Shader.fromCCPBinary(this.reader, this);
        }
        catch (error)
        {
            this.OnError(error);
            return null;
        }
        this.shaders[index] = shader;
        return shader;
    }

}


/**
 * Throws when an effect has an invalid shader version
 */
export class ErrShaderVersion extends Tw2Error
{
    constructor(data)
    {
        super(data, "Invalid version of effect file (%version%)");
    }
}


/**
 * Throws when an effect has no header
 */
export class ErrShaderHeaderSize extends Tw2Error
{
    constructor(data)
    {
        super(data, "Effect file contains no compiled effects");
    }
}

