import { TaskState } from "./types";
import { UILogic, UIMutation } from ".";

export async function uiLoad<State extends { loadState : TaskState }>(logic : UILogic<State, any>, loader : () => Promise<any>) : Promise<boolean> {
    logic.emitMutation({ loadState: { $set: 'running' } } as UIMutation<State>)

    try {
        await loader()
        logic.emitMutation({ loadState: { $set: 'success' } } as UIMutation<State>)
        return true
    } catch (e) {
        logic.emitMutation({ loadState: { $set: 'error' } } as UIMutation<State>)
        return false
    }
}
