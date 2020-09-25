import { meta, vec3, vec4 } from "global";


@meta.ctor("EveSOFDataHullLightSetItem")
export class EveSOFDataHullLightSetItem
{

    @meta.string
    name = "";

    @meta.float
    brightness = 0;

    @meta.float
    innerRadius = 0;

    @meta.color
    lightColor = vec4.create();

    @meta.float
    noiseAmplitude = 0;

    @meta.float
    noiseFrequency = 0;

    @meta.float
    noiseOctaves = 0;

    @meta.vector3
    position = vec3.create();

    @meta.float
    radius = 0;

}
