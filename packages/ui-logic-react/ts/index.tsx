import { Component } from 'react';
import * as logic from 'ui-logic-core'

export abstract class UIElement<Props, State = {}, Event extends logic.UIEvent<{}> = logic.UIEvent<{}> > extends Component<Props, State> {
    public logic?: logic.UILogic<State, Event>
    // private baseEventHandlers = new EventHandlers()

    constructor(props : Props, options : { logic?: logic.UILogic<State, Event> } = {}) {
        super(props)

        this.logic = options.logic
        if (this.logic) {
            const initialState = this.logic.getInitialState()
            if (initialState) {
                (this as any).state = this.logic.getInitialState()
            }
        }
    }
    
    async processEvent<EventName extends keyof Event>(eventName : EventName, event : Event[EventName], options? : { optional : boolean }) {
        if (!this.logic) {
            throw new Error('Tried to process event in UIElement without logic')
        }
        
        const mutation = await this.logic.processUIEvent(eventName, {
            previousState: this.state,
            event,
            direct: true,
            optional: options && options.optional
        })
        if (mutation) {
            this.processMutation(mutation)
        }
    }

    processMutation(mutation : logic.UIMutation<State>) {
        if (this.logic) {
            const newState = this.logic.withMutation(this.state, mutation as any)
            this.setState(newState)
        }
    }

    componentWillMount() {
        if (this.logic) {
            this.logic.events.addListener('mutation', mutation => this.processMutation(mutation))
        }
    }

    get elementName() {
        return Object.getPrototypeOf(this).constructor.name
    }

    componentDidMount() {
        if (this.logic) {
            this.processEvent('init', undefined, { optional: true })
        }
    }

    componentWillUnmount() {
        if (this.logic) {
            this.processEvent('cleanup', undefined, { optional: true })
            this.logic.events.removeAllListeners()
        }
    }
}
