import { AnyAction } from './lib'

export const mockWebkitPostMessage = (fn: (action: AnyAction) => void) => {
  window.webkit = {
    messageHandlers: {
      executeCommand: {
        postMessage: fn,
      },
    },
  }
}
