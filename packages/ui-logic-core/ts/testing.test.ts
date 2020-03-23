import { UIEvent, UILogic, UIEventHandlers, IncomingUIEvent, UIMutation } from "."
import { TestLogicContainer } from "./testing"
import expect = require("expect")

describe('TestLogicContainer', () => {
    it('should be able to init and process events', async () => {
        interface State {
            title: string
        }
        type Event = UIEvent<{
            setTitle: { title: string }
        }>
        class Logic extends UILogic<State, Event> implements UIEventHandlers<State, Event> {
            getInitialState(): State {
                return {
                    title: 'start',
                }
            }

            async init() {
                this.emitMutation({
                    title: { $set: 'after init' }
                })
            }

            async cleanup() {
                this.emitMutation({
                    title: { $set: 'cleaned up' }
                })
            }

            setTitle(incoming: IncomingUIEvent<State, Event, 'setTitle'>): UIMutation<State> {
                return { title: { $set: incoming.event.title } }
            }

        }

        const logic = new Logic()
        const container = new TestLogicContainer<State, Event>(logic)
        expect(container.state).toEqual({ title: 'start' })

        expect(await container.init()).toEqual([
            { title: { $set: 'after init' } }
        ])
        expect(container.state).toEqual({ title: 'after init' })

        expect(await container.processEvent('setTitle', { title: 'foo' })).toEqual([
            { title: { $set: 'foo' } }
        ])
        expect(container.state).toEqual({ title: 'foo' })

        expect(await container.cleanup()).toEqual([
            { title: { $set: 'cleaned up' } }
        ])
        expect(container.state).toEqual({ title: 'cleaned up' })
    })
})
