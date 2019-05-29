import createBrowserHistory from "history/createBrowserHistory";
import * as serviceWorker from './serviceWorker'
import runMainUi, { getUiMountpoint } from "./ui";

export async function main() {
    const history = createBrowserHistory()
    
    const uiMountPoint = getUiMountpoint()
    await runMainUi({ mountPoint: uiMountPoint, history })
    serviceWorker.unregister()
}
