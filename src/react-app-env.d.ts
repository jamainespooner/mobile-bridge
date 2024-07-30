/// <reference types="react-scripts" />
import { AnyAction, MobileBridge } from './lib/MobileBridge'

declare global {
  interface Window {
    webkit?: webkit
    executeCommand?: MobileBridge<AnyAction, AnyAction>['executeCommand']
  }
}
