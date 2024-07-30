import * as React from 'react'
import { useLayoutEffect, useMemo, useRef } from 'react'

import { useSubscribeToMobileBridge, MobileBridge, AnyAction } from '../lib'
import { MobileBridgeProviderProps, State } from './types'

// so we could error later if this is called outside Provider
const mobileBridgeInitialDispatch = () => {
  throw new Error('Should be used within MobileBridgeProvider')
}
const MobileBridgeDispatchContext =
  React.createContext<MobileBridge<AnyAction, AnyAction>['postMessage']>(mobileBridgeInitialDispatch)

// so we could error later if this is called outside Provider
const mobileBridgeInitialState = {}
const MobileBridgeStateContext = React.createContext<State<AnyAction>>(mobileBridgeInitialState)

export function useMobileBridgeDispatch<TWebActions extends AnyAction>() {
  const value = React.useContext(
    MobileBridgeDispatchContext as React.Context<MobileBridge<unknown, TWebActions>['postMessage']>
  )
  if (value === mobileBridgeInitialDispatch) {
    throw new Error('useMobileBridgeState should be used within MobileBridgeProvider')
  }
  return value
}

export function useSubscribeToMobileBridgeAction<
  TNativeActions extends AnyAction = AnyAction,
  U extends keyof State<TNativeActions> = AnyAction['type']
>(callback: (action: State<TNativeActions>[U]) => void, type: U): void
export function useSubscribeToMobileBridgeAction<
  TNativeActions extends AnyAction = AnyAction,
  U extends keyof State<TNativeActions> = AnyAction['type']
>(callback: (state: State<TNativeActions> | State<TNativeActions>[U]) => void, type?: U) {
  const didMountRef = useRef(false)
  const value = React.useContext(MobileBridgeStateContext as React.Context<State<TNativeActions>>)

  if (value === mobileBridgeInitialState) {
    throw new Error('useMobileBridgeState should be used within MobileBridgeProvider')
  }

  const slice = useMemo(() => (type ? value[type] : value), [type, value])
  const cbRef = useRef(callback)

  useLayoutEffect(() => {
    cbRef.current = callback
  })

  useLayoutEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }

    return cbRef.current(slice)
  }, [slice])
}

export const MobileBridgeProvider = <
  TNativeActions extends AnyAction = AnyAction,
  TWebActions extends AnyAction = AnyAction
>({
  children,
  value,
  reducer,
}: React.PropsWithChildren<MobileBridgeProviderProps<TNativeActions, TWebActions>>) => {
  const [state, handleNativeEvents] = React.useReducer(reducer, {})

  const postMessage = useRef((action: TWebActions) => value.postMessage(action))

  useSubscribeToMobileBridge<TNativeActions, TWebActions>(value, handleNativeEvents)

  const MobileBridgeStateContextProvider = (MobileBridgeStateContext as React.Context<State<TNativeActions>>).Provider
  const MobileBridgeDispatchContextProvider = (
    MobileBridgeDispatchContext as React.Context<typeof value['postMessage']>
  ).Provider

  return (
    <MobileBridgeStateContextProvider value={state}>
      <MobileBridgeDispatchContextProvider value={postMessage.current}>{children}</MobileBridgeDispatchContextProvider>
    </MobileBridgeStateContextProvider>
  )
}
