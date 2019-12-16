import { meta, vec3, vec4, Tw2BaseClass } from "global";


@meta.notImplemented
@meta.type("Tr2PointLight", true)
export class Tr2PointLight extends Tw2BaseClass
{

    @meta.black.string
    name = "";

    @meta.black.float
    brightness = 0;

    @meta.black.color
    color = vec4.create();

    @meta.black.float
    innerRadius = 0;

    @meta.black.float
    noiseAmplitude = 0;

    @meta.black.float
    noiseFrequency = 0;

    @meta.black.float
    noiseOctaves = 0;

    @meta.black.vector3
    position = vec3.create();

    @meta.black.float
    radius = 0;

}
