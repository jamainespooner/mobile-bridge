import { BridgeEventHandler } from './types'

export abstract class IMobileBridge<TNativeActions, TWebActions> {
  /**
   * subscribes to port messages
   * Returns unsubscribe function which removes message listener and closes the port
   * @param handleEvent
   */
  abstract subscribe(handleEvent: BridgeEventHandler<TNativeActions>): Promise<() => void>

  /**
   * Waits for the port and posts an action to this port
   * @param action
   */
  abstract postMessage(action: TWebActions): Promise<void>

  abstract executeCommand(action: TNativeActions): Promise<void>
}
