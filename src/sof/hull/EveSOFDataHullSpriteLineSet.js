import { meta } from "utils";


@meta.ctor("EveSOFDataHullSpriteLineSet")
export class EveSOFDataHullSpriteLineSet
{

    @meta.string
    name = "";

    @meta.list("EveSOFDataHullSpriteLineSetItem")
    items = [];

    @meta.boolean
    skinned = false;

    @meta.string
    visibilityGroup = "";

}
