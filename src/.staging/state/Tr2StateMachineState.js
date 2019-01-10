import {Tw2BaseClass} from "../class";

/**
 * Tr2StateMachineState
 *
 * @parameter {Array.<StateAction>} actions                   -
 * @parameter {Tr2SyncToAnimation} finalizer                  -
 * @parameter {Array.<Tr2StateMachineTransition>} transitions -
 */
export default class Tr2StateMachineState extends Tw2BaseClass
{

    actions = [];
    finalizer = null;
    transitions = [];

}

Tw2BaseClass.define(Tr2StateMachineState, Type =>
{
    return {
        isStaging: true,
        type: "Tr2StateMachineState",
        props: {
            actions: Type.ARRAY,
            finalizer: ["Tr2SyncToAnimation"],
            transitions: [["Tr2StateMachineTransition"]]
        }
    };
});
