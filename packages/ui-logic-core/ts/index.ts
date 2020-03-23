import { default as update, Spec } from 'immutability-helper';
import { EventEmitter } from "events";

export type UIEvent<EventTypes> = { init?: undefined, cleanup?: undefined } & {
    [EventName in keyof EventTypes]: EventTypes[EventName]
}
export type UIMutation<State> = Spec<State>

export interface UILogicInterface<State, Event extends UIEvent<{}>> {
    events: EventEmitter

    getInitialState(): State | null
    processUIEvent<EventName extends keyof Event>(
        eventName: EventName,
        options: ProcessUIEventOptions<State, Event, EventName>
    ): Promise<UIMutation<State> | null>
}
export type ProcessUIEventOptions<State, Event extends UIEvent<{}>, EventName extends keyof Event> = {
    event: Event[EventName],
    previousState: State,
    optional?: boolean,
    direct?: boolean
}
export type IncomingUIEvent<State, Event extends UIEvent<{}>, EventName extends keyof Event> = {
    previousState: State,
    event: Event[EventName]
}

export type UIEventHandlers<State, Event extends UIEvent<{}>> = {
    [EventName in keyof Event]: UIEventHandler<State, Event, EventName>
}
export type UIEventHandler<State, Event extends UIEvent<{}>, EventName extends keyof Event> =
    (incoming: IncomingUIEvent<State, Event, EventName>) => UIMutation<State> | Promise<UIMutation<State>> | Promise<void> | void

export abstract class UILogic<State, Event extends UIEvent<{}>> {
    events = new EventEmitter()

    abstract getInitialState(): State

    emitMutation(mutation: UIMutation<State>) {
        this.events.emit('mutation', mutation)
    }

    withMutation(state: State, mutation: UIMutation<State> | void | undefined) {
        return update(state, mutation as any || {})
    }

    async processUIEvent<EventName extends keyof Event>(eventName: EventName, options: ProcessUIEventOptions<State, Event, EventName>): Promise<UIMutation<State> | void> {
        const handler: UIEventHandler<State, Event, EventName> = (this as any)[eventName]
        if (!handler) {
            if (!options.optional) {
                throw new Error(
                    `Tried to process UI event which I couldn't find a handler method for (${eventName})`
                )
            } else {
                return
            }
        }

        const mutation = await handler.call(this, {
            previousState: options.previousState,
            event: 'event' in options ? (options as any).event : undefined
        })

        this.events.emit('eventProcessed', { event: eventName, mutation, oldState: options.previousState })
        if (mutation) {
            if (options.direct) {
                return mutation
            } else {
                this.emitMutation(mutation)
                return
            }
        } else {
            return
        }
    }
}

