import { AndroidMobileBridge } from './AndroidMobileBridge'
import { TransformActionsCreatorMapObjectToActionUnion } from './types'

describe('AndroidMobileBridge', () => {
  const mockActions = {
    setSomething: jest.fn().mockImplementation((payload = {}) => ({ type: 'SET_SOMETHING', payload })),
  }

  const mockAndroidMobileBridgeFactory = () =>
    new AndroidMobileBridge<
      TransformActionsCreatorMapObjectToActionUnion<typeof mockActions>,
      TransformActionsCreatorMapObjectToActionUnion<typeof mockActions>
    >()

  it('should create a port proxing events to the Channel Messaging API interface', () => {
    jest.spyOn(window, 'addEventListener')

    mockAndroidMobileBridgeFactory()
    expect(window.addEventListener).toBeCalledWith('message', expect.any(Function))
  })

  const mockPortEventData = {
    fakePayload: 'fake',
  }

  const mockPort = {
    postMessage: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    start: jest.fn(),
    close: jest.fn(),
  }

  const mockAndroidBridgePort = () => {
    const myCreatePort = jest.spyOn(AndroidMobileBridge.prototype as any, 'createPort')
    myCreatePort.mockImplementation(() => mockPort)
  }

  describe('subscribe', () => {
    beforeAll(() => {
      mockAndroidBridgePort()
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should attach the passed event to the port message listener', async () => {
      const mobileAndroidBridge = mockAndroidMobileBridgeFactory()
      await mobileAndroidBridge.subscribe(mockActions.setSomething)

      expect(mockPort.addEventListener).toHaveBeenCalledWith('message', expect.any(Function))
    })

    it('should pass event data as payload of passed action event', async () => {
      mockPort.addEventListener = jest
        .fn()
        .mockImplementation((_type, fn) => fn({ data: JSON.stringify(mockPortEventData) }))
      const mobileAndroidBridge = mockAndroidMobileBridgeFactory()
      await mobileAndroidBridge.subscribe(mockActions.setSomething)

      expect(mockActions.setSomething).toHaveBeenCalledWith(mockPortEventData)
    })

    it('should call start on message port', async () => {
      const mobileAndroidBridge = mockAndroidMobileBridgeFactory()
      await mobileAndroidBridge.subscribe(mockActions.setSomething)

      expect(mockPort.start).toHaveBeenCalled()
    })

    describe('returned unsubscribe method called', () => {
      beforeEach(async () => {
        const mobileAndroidBridge = mockAndroidMobileBridgeFactory()
        const unsubscribe = await mobileAndroidBridge.subscribe(mockActions.setSomething)
        unsubscribe()
      })

      it('should call removeEventListener for the attached action event', async () => {
        expect(mockPort.removeEventListener).toHaveBeenCalledWith('message', expect.any(Function))
      })

      it('should call close on message port', async () => {
        expect(mockPort.close).toHaveBeenCalled()
      })
    })
  })

  describe('postMessage', () => {
    beforeAll(() => {
      mockAndroidBridgePort()
    })

    it('should call postMessage on message port', async () => {
      const mobileAndroidBridge = mockAndroidMobileBridgeFactory()
      await mobileAndroidBridge.postMessage(mockActions.setSomething())
      expect(mockPort.postMessage).toHaveBeenCalledWith(JSON.stringify(mockActions.setSomething()))
    })
  })

  describe('executeCommand', () => {
    it('should throw a not supported error on execution', async () => {
      const mobileAndroidBridge = mockAndroidMobileBridgeFactory()

      try {
        await mobileAndroidBridge.executeCommand()
        throw new Error('Command should have failed')
      } catch (e: any) {
        expect(e.message).toBe('Not supported')
      }
    })
  })
})
