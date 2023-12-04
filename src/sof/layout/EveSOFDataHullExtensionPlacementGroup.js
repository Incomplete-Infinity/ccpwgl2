import { meta } from "utils";
import{ vec3 } from "math";


@meta.type("EveSOFDataHullExtensionPlacementGroup")
export class EveSOFDataHullExtensionPlacementGroup extends meta.Model
{

    @meta.string
    name = "";

    @meta.boolean
    enabled = true;

    @meta.list("EveSOFDataDistributionDepletionCount")
    depletionCounters = [];

    @meta.list()
    distributionConditions = [];

    @meta.list("EveSOFDataHullExtensionPlacement")
    placements = [];

}
