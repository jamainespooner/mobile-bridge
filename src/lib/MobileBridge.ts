import { isAndroid, isMobile } from 'react-device-detect'

import { AndroidMobileBridge } from './AndroidMobileBridge'
import { IMobileBridge } from './IMobileBridge'
import { IosMobileBridge } from './IosMobileBridge'
import { BridgeEventHandler, AnyAction } from './types'

export class MobileBridge<TNativeActions, TWebActions> extends IMobileBridge<TNativeActions, TWebActions> {
  private constructor(private bridge?: IMobileBridge<TNativeActions, TWebActions>) {
    super()
  }

  static create<T = AnyAction, U = AnyAction>() {
    if (isMobile) {
      if (isAndroid) {
        return new MobileBridge(new AndroidMobileBridge<T, U>())
      }

      // as per our agreement, iOS adds sendMessage message handler so we can use to check if its iOS
      if (window?.webkit?.messageHandlers?.executeCommand.postMessage) {
        return new MobileBridge(new IosMobileBridge<T, U>())
      }
    }

    return new MobileBridge<T, U>()
  }

  async subscribe(handleEvent: BridgeEventHandler<TNativeActions>) {
    const unsubscribe = await this.bridge?.subscribe(handleEvent)
    return unsubscribe || (() => void 0)
  }

  async postMessage(action: TWebActions): Promise<void> {
    await this.bridge?.postMessage(action)
  }

  async executeCommand(action: TNativeActions) {
    await this.bridge?.executeCommand(action)
  }
}

/** Pass the map object of native and web actions as first two generics to form list of supported actions */
export function mobileBridgeFactory<TNativeActions extends AnyAction, TWebActions extends AnyAction>() {
  const MobileBridgeWithActions = MobileBridge<TNativeActions, TWebActions>

  return MobileBridgeWithActions.create<TNativeActions, TWebActions>()
}
