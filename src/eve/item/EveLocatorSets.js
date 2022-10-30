import { meta } from "utils";
import { vec3, quat, vec4, mat4 } from "math";


@meta.type("EveLocatorSetItem")
@meta.stage(1)
export class EveLocatorSetItem extends meta.Model
{

    @meta.uint
    boneIndex = -1;

    @meta.vector3
    position = vec3.create();

    @meta.quaternion
    rotation = quat.create();

    @meta.vector3
    scaling = vec3.fromValues(1,1,1);

    /**
     * Gets the locator's local transform
     * @param {mat4} m
     * @returns {mat4} m
     */
    GetTransform(m)
    {
        return mat4.fromRotationTranslationScale(m, this.rotation, this.position, this.scaling);
    }

    /**
     * Black reader
     * TODO: Confirm if this is correct
     * @param {Tw2BlackBinaryReader} r
     */
    static blackStruct(r)
    {
        const item = new EveLocatorSetItem();
        vec3.copy(item.position,r.ReadF32Array(3));
        vec4.copy(item.rotation, r.ReadF32Array(4));
        item.boneIndex = r.ReadF32Array(1) * 255 - 1;
        return item;
    }

}



@meta.type("EveLocatorSets")
export class EveLocatorSets extends meta.Model
{

    @meta.string
    name = "";

    @meta.list(EveLocatorSetItem)
    locators = [];

}
