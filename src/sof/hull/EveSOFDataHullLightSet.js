import { meta } from "global";


@meta.ctor("EveSOFDataHullLightSet")
export class EveSOFDataHullLightSet
{

    @meta.string
    name = "";

    @meta.list("EveSOFDataHullLightSetItem")
    items = [];

    @meta.float
    noiseAmplitude = 0;

    @meta.float
    noiseOctaves = 0;

    @meta.string
    visibilityGroup = "";

}
