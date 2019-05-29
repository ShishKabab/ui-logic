import expect from 'expect'
import { UILogic, UIEvent, UIEventHandlers, IncomingUIEvent, UIMutation } from '.';

describe('UILogic core', () => {
    it('should be able to process incoming events', async () => {
        interface State {
            title : string
        }
        type Event = UIEvent<{
            setTitle : { title : string }
        }>
        class Logic extends UILogic<State, Event> implements UIEventHandlers<State, Event> {
            getInitialState() : State {
                return {
                    title: 'start',
                }
            }

            setTitle(incoming : IncomingUIEvent<State, Event, 'setTitle'>) : UIMutation<State> {
                return { title: { $set: incoming.event.title } }
            }

        }

        const logic = new Logic()
        const initialState = logic.getInitialState()
        expect(initialState).toEqual({ title: 'start' })
        expect(logic.withMutation(
            initialState,
            await logic.processUIEvent('setTitle', { event: { title: 'bla' }, previousState: initialState, direct: true })
        )).toEqual({ title: 'bla' })
    })

    it('should be able to process incoming events using previous state', async () => {
        interface State {
            counter : number
        }
        type Event = UIEvent<{
            increaseCounter : undefined
        }>
        class Logic extends UILogic<State, Event> implements UIEventHandlers<State, Event> {
            getInitialState() : State {
                return {
                    counter: 0,
                }
            }

            increaseCounter(incoming : IncomingUIEvent<State, Event, 'increaseCounter'>) : UIMutation<State> {
                return { counter: { $set: incoming.previousState.counter + 1 } }
            }
        }

        const logic = new Logic()
        const initialState = logic.getInitialState()
        expect(initialState).toEqual({ counter: 0 })
        expect(logic.withMutation(
            initialState,
            await logic.processUIEvent('increaseCounter', { previousState: initialState, direct: true, event: undefined })
        )).toEqual({ counter: 1 })
    })

    it('should be able to emit processed events', async () => {
        interface State {
            title : string
        }
        type Event = UIEvent<{
            setTitle : { title : string }
        }>
        class Logic extends UILogic<State, Event> implements UIEventHandlers<State, Event> {
            getInitialState() : State {
                return {
                    title: 'start',
                }
            }

            setTitle(incoming : IncomingUIEvent<State, Event, 'setTitle'>) : UIMutation<State> {
                return { title: { $set: incoming.event.title } }
            }

        }

        const logic = new Logic()
        let state = logic.getInitialState()
        expect(state).toEqual({ title: 'start' })

        logic.events.on('mutation', (mutation : UIMutation<State>) => state = logic.withMutation(state, mutation))
        await logic.processUIEvent('setTitle', { event: { title: 'bla' }, previousState: state })
        expect(state).toEqual({ title: 'bla' })
    })
})
