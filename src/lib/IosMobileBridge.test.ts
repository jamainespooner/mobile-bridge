import { mockWebkitPostMessage } from '../test-utils'
import { IosMobileBridge } from './IosMobileBridge'
import { TransformActionsCreatorMapObjectToActionUnion } from './types'

describe('IosMobileBridge', () => {
  const mockActions = {
    setSomething: (payload = {}) => ({ type: 'SET_SOMETHING', payload }),
  }

  const mockIosBridgeFactory = () =>
    new IosMobileBridge<
      TransformActionsCreatorMapObjectToActionUnion<typeof mockActions>,
      TransformActionsCreatorMapObjectToActionUnion<typeof mockActions>
    >()

  describe('postMessage', () => {
    it('should call webkit object postMessage with action', () => {
      const postMessageFn = jest.fn()
      mockWebkitPostMessage(postMessageFn)
      const mobileBridge = mockIosBridgeFactory()
      mobileBridge.postMessage(mockActions.setSomething())

      expect(postMessageFn).toHaveBeenCalledWith(mockActions.setSomething())
    })
  })

  describe('subscribe/execute', () => {
    it('should assign subscribe argument as handle event and call it with action on executeCommand', () => {
      const handleEventFn = jest.fn()
      const mobileBridge = mockIosBridgeFactory()
      mobileBridge.subscribe(handleEventFn)
      mobileBridge.executeCommand(mockActions.setSomething())

      expect(handleEventFn).toHaveBeenCalledWith(mockActions.setSomething())
    })
  })
})
