import { meta } from "global";
import { Tw2ParticleConstraint } from "./Tw2ParticleConstraint";


@meta.notImplemented
@meta.ctor("Tr2PlaneConstraint")
export class Tr2PlaneConstraint extends Tw2ParticleConstraint
{

    @meta.list("Tw2PartcileAttributeGenerator")
    generators = [];

    @meta.float
    reflectionNoise = 0;

}
