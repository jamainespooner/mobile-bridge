import * as React from 'react'

import { MobileBridge } from './MobileBridge'

import { BridgeEventHandler } from './types'

export const useSubscribeToMobileBridge = <T, U>(bridge: MobileBridge<T, U>, handler: BridgeEventHandler<T>) => {
  React.useEffect(() => {
    let unsubscribed = false
    let unsubscribe: () => void
    const subscribe = async () => bridge.subscribe(handler)

    subscribe().then(unsub => {
      if (unsubscribed) {
        return unsub()
      }

      unsubscribe = unsub
    })

    return () => {
      unsubscribed = true
      unsubscribe?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
