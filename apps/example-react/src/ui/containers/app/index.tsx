import React from 'react';
import { UIElement } from 'ui-logic-react';
import Logic, { State, Event } from './logic';

interface Props {
}

class App extends UIElement<Props, State, Event> {
    constructor(props : Props) {
        super(props, { logic: new Logic() })
    }

    render() {
        return (
            <div
                style={!this.state.modified ? { cursor: 'pointer' } : {}}
                onClick={() => this.processEvent('setText', { text: 'You clicked me...' })}
            >
                { this.state.text }
            </div>
        )
    }
}

export default App
