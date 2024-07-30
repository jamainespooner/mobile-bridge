import { IMobileBridge } from './IMobileBridge'
import { BridgeEventHandler } from './types'

export class AndroidMobileBridge<TNativeActions, TWebActions> extends IMobileBridge<TNativeActions, TWebActions> {
  private readonly messagePort: Promise<MessagePort>

  constructor() {
    super()
    this.messagePort = this.createPort()
  }

  private createPort() {
    return new Promise<MessagePort>(resolve => {
      window.addEventListener('message', e => {
        if (e.source === null && !e.origin && e.ports[0] !== null) {
          resolve(e.ports[0])
        }
      })
    })
  }

  async subscribe(handleEvent: BridgeEventHandler<TNativeActions>) {
    const port = await this.messagePort
    const handleMessage = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data) as TNativeActions
        handleEvent(data)
      } catch (e) {
        // log to DD ?
      }
    }

    port.addEventListener('message', handleMessage)
    port.start()

    return () => {
      port.removeEventListener('message', handleMessage)
      port.close()
    }
  }

  async postMessage(action: TWebActions) {
    const port = await this.messagePort
    port.postMessage(JSON.stringify(action))
  }

  async executeCommand(): Promise<never> {
    throw new Error('Not supported')
  }
}
