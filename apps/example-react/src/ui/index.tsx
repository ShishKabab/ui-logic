import * as history from 'history'
import React from 'react';
import ReactDOM from 'react-dom';

import App from './containers/app'

export default async function runMainUi(options : { history : history.History, mountPoint : Element }) {
    ReactDOM.render((
        <App />
    ), options.mountPoint)
}

export function getUiMountpoint(mountPoint? : Element) : Element {
    const defaultMountPointSelector = '#root'
    if (!mountPoint) {
        mountPoint = document.querySelector(defaultMountPointSelector) || undefined
    }
    if (!mountPoint) {
        throw new Error(`Could not find UI mount point: ${defaultMountPointSelector}`)
    }

    return mountPoint
}
