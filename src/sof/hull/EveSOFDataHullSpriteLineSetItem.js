import { meta, quat, vec3 } from "global";


@meta.ctor("EveSOFDataHullSpriteLineSetItem")
export class EveSOFDataHullSpriteLineSetItem
{

    @meta.float
    blinkPhase = 0;

    @meta.float
    blinkPhaseShift = 0;

    @meta.float
    blinkRate = 0;

    @meta.uint
    boneIndex = -1;

    @meta.uint
    colorType = 0;

    @meta.float
    falloff = 0;

    @meta.uint
    groupIndex = -1;

    @meta.float
    intensity = 0;

    @meta.boolean
    isCircle = false;

    @meta.float
    maxScale = 0;

    @meta.float
    minScale = 0;

    @meta.vector3
    position = vec3.create();

    @meta.quaternion
    rotation = quat.create();

    @meta.vector3
    scaling = vec3.fromValues(1, 1, 1);

    @meta.float
    spacing = 0;

}
