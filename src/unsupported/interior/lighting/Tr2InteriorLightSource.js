import { meta, vec3, vec4, Tw2BaseClass } from "global";


@meta.notImplemented
@meta.ctor("Tr2InteriorLightSource")
export class Tr2InteriorLightSource extends Tw2BaseClass
{

    @meta.string
    name = "";

    @meta.color
    color = vec4.create();

    @meta.float
    coneAlphaInner = 0;

    @meta.float
    coneAlphaOuter = 0;

    @meta.vector3
    coneDirection = vec3.create();

    @meta.float
    falloff = 0;

    @meta.float
    importanceBias = 0;

    @meta.float
    importanceScale = 0;

    @meta.struct("Tr2KelvinColor")
    kelvinColor = null;

    @meta.vector3
    position = vec3.create();

    @meta.float
    radius = 0;

    @meta.boolean
    useKelvinColor = false;

}
