import { IMobileBridge } from './IMobileBridge'
import { BridgeEventHandler } from './types'

export class IosMobileBridge<TNativeActions, TWebActions> extends IMobileBridge<TNativeActions, TWebActions> {
  private handleEvent: BridgeEventHandler<TNativeActions> | null = null
  async postMessage(action: TWebActions): Promise<void> {
    window.webkit?.messageHandlers?.executeCommand?.postMessage(action)
  }

  async subscribe(handleEvent: BridgeEventHandler<TNativeActions>) {
    this.handleEvent = handleEvent
    return () => void 0
  }

  async executeCommand(action: TNativeActions): Promise<void> {
    this.handleEvent?.(action)
  }
}
