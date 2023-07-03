import { Component } from 'react'
import * as logic from 'ui-logic-core'

export abstract class UIElement<
    Props,
    State = {},
    Event extends logic.UIEvent<{}> = logic.UIEvent<{}>
> extends Component<Props, State> {
    public logic?: logic.UILogic<State, Event>
    // private baseEventHandlers = new EventHandlers()
    private newestState?: State

    constructor(
        props: Props,
        options: { logic?: logic.UILogic<State, Event> } = {},
    ) {
        super(props)

        this.logic = options.logic
        if (this.logic) {
            this.logic.events.addListener('mutation', (mutation) =>
                this.processMutation(mutation),
            )

            const initialState = this.logic.getInitialState()
            if (initialState) {
                ;(this as any).state = this.newestState = this.logic.getInitialState()
            }
        }
    }

    async processEvent<EventName extends keyof Event>(
        eventName: EventName,
        event: Event[EventName],
        options?: { optional: boolean },
    ) {
        if (!this.logic) {
            throw new Error('Tried to process event in UIElement without logic')
        }

        const mutation = await this.logic.processUIEvent(eventName, {
            previousState: this.newestState || this.state,
            event,
            direct: true,
            optional: options && options.optional,
        })
        if (mutation) {
            this.processMutation(mutation)
        }
    }

    processMutation(mutation: logic.UIMutation<State>) {
        if (this.logic) {
            this.newestState = this.logic.withMutation(
                this.newestState || this.state,
                mutation as any,
            )
            this.setState(this.newestState)
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
