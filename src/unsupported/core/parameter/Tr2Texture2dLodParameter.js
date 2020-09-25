import { meta } from "global";
import { Tw2Parameter } from "core";

@meta.notImplemented
@meta.ctor("Tr2Texture2dLodParameter")
export class Tr2Texture2dLodParameter extends Tw2Parameter
{

    @meta.string
    name = "";

    @meta.struct("Tr2LodResource")
    lodResource = null;

}
