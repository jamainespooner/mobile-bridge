import { render } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import React from 'react'

import { AnyAction, MobileBridge, TransformActionsCreatorMapObjectToActionUnion } from '../lib'

import { MobileBridgeProvider, useSubscribeToMobileBridgeAction, useMobileBridgeDispatch } from './MobileBridgeContext'
import { State } from './types'

describe('MobileBridgeContext', () => {
  const mockUnsubscribe = jest.fn()
  const mobileBridge = {
    subscribe: jest.fn(),
    postMessage: jest.fn(),
    executeCommand: jest.fn(),
  } as MobileBridge<MockNativeActions, MockWebActions>

  const mockNativeAction = { type: 'SAID_SOMETHING' } as const
  const mockNativeActionList = {
    saidSomething: (payload: { something: string }) => ({ ...mockNativeAction, payload }),
  }
  type MockNativeActions = TransformActionsCreatorMapObjectToActionUnion<typeof mockNativeActionList>

  const mockWebAction = { type: 'SAY_SOMETHING' } as const
  const mockWebActionList = {
    saySomething: (payload: { something: string }) => ({ ...mockWebAction, payload }),
  }
  type MockWebActions = TransformActionsCreatorMapObjectToActionUnion<typeof mockWebActionList>

  const mockReducer = (state: State<MockNativeActions>, action: MockNativeActions) => {
    switch (action?.type) {
      case mockNativeAction['type']:
        return {
          ...state,
          [action.type]: action.payload,
        }
      default:
        return state
    }
  }

  const renderMobileBridgeProvider = (children?: React.ReactNode) =>
    render(
      <MobileBridgeProvider value={mobileBridge} reducer={mockReducer}>
        {children}
      </MobileBridgeProvider>
    )

  describe('<MobileBridgeProvider />', () => {
    it('should subscribe to native events', () => {
      renderMobileBridgeProvider()
      expect(mobileBridge.subscribe).toHaveBeenCalledWith(expect.any(Function))
    })
  })

  const createMockWrapper =
    (value = mobileBridge) =>
    ({ children }: { children: React.ReactNode }) =>
      (
        <MobileBridgeProvider value={value} reducer={mockReducer}>
          {children}
        </MobileBridgeProvider>
      )

  describe('useMobileBridgeDispatch', () => {
    const renderUseMobileBridgeDispatch = (wrapper = createMockWrapper()) =>
      renderHook(() => useMobileBridgeDispatch<MockWebActions>(), { wrapper })

    describe('with provider', () => {
      it('should return the wrapped ref postMessage method', () => {
        const { result } = renderUseMobileBridgeDispatch()
        expect(result.current).toEqual(expect.any(Function))
      })
    })

    describe('no provider', () => {
      it('should throw an error', () => {
        const { result } = renderUseMobileBridgeDispatch(({ children }) => <div>{children}</div>)
        expect(result.error).toEqual(expect.any(Error))
      })
    })
  })

  describe('useSubscribeToMobileBridgeAction', () => {
    const mockCallbackFn = jest.fn()

    const renderUseSubscribeToMobileBridgeAction = (wrapper = createMockWrapper()) =>
      renderHook(
        () =>
          useSubscribeToMobileBridgeAction<MockNativeActions, typeof mockNativeAction['type']>(
            mockCallbackFn,
            mockNativeAction.type
          ),
        { wrapper }
      )

    describe('with provider', () => {
      describe('no changes to native events state', () => {
        it('should not execute callback if state change due to subscribe action', () => {
          const { result } = renderUseSubscribeToMobileBridgeAction()
          expect(mockCallbackFn).not.toHaveBeenCalled()
          expect(result.error).toBeUndefined()
        })
      })

      describe('changes to native events state', () => {
        const mockPayload = { something: 'actioned' }
        const mobileBridgeWithMessage = {
          postMessage: jest.fn(),
          executeCommand: jest.fn(),
          subscribe: jest.fn().mockImplementation(cb => {
            cb({ ...mockNativeAction, payload: mockPayload })
            return Promise.resolve(mockUnsubscribe)
          }),
        } as MobileBridge<MockNativeActions, AnyAction>

        it('should not execute callback if state change due to subscribe action', () => {
          renderUseSubscribeToMobileBridgeAction(createMockWrapper(mobileBridgeWithMessage))
          expect(mockCallbackFn).toHaveBeenCalledWith(mockPayload)
        })
      })
    })

    describe('no provider', () => {
      it('should throw an error', () => {
        const { result } = renderUseSubscribeToMobileBridgeAction(({ children }) => <div>{children}</div>)

        expect(result.error).toEqual(expect.any(Error))
      })
    })
  })
})
