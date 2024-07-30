import * as rdd from 'react-device-detect'

import { mockWebkitPostMessage } from '../test-utils'

import { mobileBridgeFactory } from './MobileBridge'
import { TransformActionsCreatorMapObjectToActionUnion } from './types'

const mockAndroidUnsubscribe = jest.fn()
const mockAndroidSubscribe = jest.fn().mockReturnValue(mockAndroidUnsubscribe)
const mockAndroidPostMessage = jest.fn()
const mockAndroidExecuteCommand = jest.fn()
jest.mock('./AndroidMobileBridge', () => {
  return {
    AndroidMobileBridge: jest.fn().mockImplementation(() => ({
      subscribe: mockAndroidSubscribe,
      postMessage: mockAndroidPostMessage,
      executeCommand: mockAndroidExecuteCommand,
    })),
  }
})

const mockIosSubscribe = jest.fn()
const mockIosPostMessage = jest.fn()
const mockIosExecuteCommand = jest.fn()
jest.mock('./IosMobileBridge', () => {
  return {
    IosMobileBridge: jest.fn().mockImplementation(() => ({
      subscribe: mockIosSubscribe,
      postMessage: mockIosPostMessage,
      executeCommand: mockIosExecuteCommand,
    })),
  }
})

const mockActions = {
  setSomething: (payload = {}) => ({ type: 'SET_SOMETHING', payload }),
}
type MockActions = TransformActionsCreatorMapObjectToActionUnion<typeof mockActions>

describe('MobileBridge', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  const getMobileBridge = () => mobileBridgeFactory<MockActions, MockActions>()

  describe('is Android', () => {
    it('should create as an AndroidBridge', () => {
      ;(rdd.isMobile as boolean) = true
      ;(rdd.isAndroid as boolean) = true

      getMobileBridge().executeCommand(mockActions.setSomething())
      expect(mockAndroidExecuteCommand).toHaveBeenCalledTimes(1)
    })
  })

  describe('has webkit message handler', () => {
    it('should create as an IOSBridge', () => {
      ;(rdd.isMobile as boolean) = true
      ;(rdd.isAndroid as boolean) = false

      mockWebkitPostMessage(jest.fn())

      getMobileBridge().executeCommand(mockActions.setSomething())
      expect(mockIosExecuteCommand).toHaveBeenCalledTimes(1)
    })
  })

  describe('is not mobile', () => {
    it('should not construct either OS bridge', () => {
      ;(rdd.isMobile as boolean) = false
      ;(rdd.isAndroid as boolean) = true

      mockWebkitPostMessage(jest.fn())

      getMobileBridge().executeCommand(mockActions.setSomething())
      expect(mockAndroidExecuteCommand).not.toHaveBeenCalled()
      expect(mockIosExecuteCommand).not.toHaveBeenCalled()
    })
  })

  describe('subscribe', () => {
    const mockHandler = () => mockActions.setSomething()

    describe('with bridge and unsubscribe method', () => {
      beforeAll(() => {
        ;(rdd.isMobile as boolean) = true
        ;(rdd.isAndroid as boolean) = true
      })

      it('should call same method in the used bridge', () => {
        const mobBridge = getMobileBridge()

        mobBridge.subscribe(mockHandler)
        expect(mockAndroidSubscribe).toHaveBeenCalledWith(mockHandler)
      })

      it('should return the unsubscribe method', async () => {
        const mobBridge = getMobileBridge()
        const unsubscribe = await mobBridge.subscribe(mockHandler)
        expect(unsubscribe).toEqual(mockAndroidUnsubscribe)
      })
    })

    describe('with no unsubscribe method', () => {
      it('should return a noop function', async () => {
        ;(rdd.isMobile as boolean) = true
        ;(rdd.isAndroid as boolean) = false
        mockWebkitPostMessage(jest.fn())

        const mobBridge = getMobileBridge()
        const unsubscribe = await mobBridge.subscribe(mockHandler)
        expect(unsubscribe).toEqual(expect.any(Function))
      })
    })

    describe('no bridge', () => {
      it('should still return a noop function', async () => {
        ;(rdd.isMobile as boolean) = false
        const mobBridge = getMobileBridge()
        const unsubscribe = await mobBridge.subscribe(mockHandler)
        expect(unsubscribe).toEqual(expect.any(Function))
      })
    })
  })

  describe('executeCommand', () => {
    describe('with bridge', () => {
      it('should call same method in the used bridge', () => {
        ;(rdd.isMobile as boolean) = true
        ;(rdd.isAndroid as boolean) = true
        const mobBridge = getMobileBridge()

        mobBridge.postMessage(mockActions.setSomething())
        expect(mockAndroidPostMessage).toHaveBeenCalledWith(mockActions.setSomething())
      })
    })

    describe('no bridge', () => {
      it('should handle without errors', async () => {
        ;(rdd.isMobile as boolean) = false
        const mobBridge = getMobileBridge()
        mobBridge.postMessage(mockActions.setSomething())
        expect(mockAndroidPostMessage).not.toHaveBeenCalled()
        expect(mockIosPostMessage).not.toHaveBeenCalled()
      })
    })
  })
})
