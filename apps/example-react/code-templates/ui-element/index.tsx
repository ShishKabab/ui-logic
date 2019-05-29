import React from 'react';
import { UIElement } from 'ui-logic-react';
import Logic, { State, Event } from './logic';

interface Props {
}

export default class [Name] extends UIElement<Props, State, Event> {
    constructor(props : Props) {
        super(props, { logic: new Logic() })
    }

    render() {
        return (
            <div></div>
        )
    }
}
