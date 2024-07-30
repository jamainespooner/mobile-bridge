import { renderHook } from '@testing-library/react-hooks'

import { MobileBridge } from './MobileBridge'

import { useSubscribeToMobileBridge } from './useSubscribeToMobileBridge'

describe('useSubscribeToMobileBridge', () => {
  const mockUnsubscribe = jest.fn()
  const mockBridge = {
    subscribe: jest.fn().mockImplementation(() => Promise.resolve(mockUnsubscribe)),
  }
  const mockHandler = jest.fn()

  const renderUseSubscribeToMobileBridge = () =>
    renderHook(() => useSubscribeToMobileBridge(mockBridge as unknown as MobileBridge<unknown, unknown>, mockHandler))

  describe('on mount', () => {
    it('should call subscribe method on bridge', () => {
      renderUseSubscribeToMobileBridge()

      expect(mockBridge.subscribe).toHaveBeenCalledWith(mockHandler)
    })
  })

  describe('unmount', () => {
    it('should call unsubscribe method', () => {
      const { unmount } = renderUseSubscribeToMobileBridge()
      unmount()
      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })
})
