import { MobileBridge, AnyAction } from '../lib'

type FindByType<Union, Type> = Union extends { type: Type } ? Union : never

export type State<TNativeActions extends AnyAction> = {
  [K in TNativeActions['type']]?: FindByType<TNativeActions, K>['payload']
}

export interface MobileBridgeProviderProps<TNativeActions extends AnyAction, TWebActions extends AnyAction> {
  value: MobileBridge<TNativeActions, TWebActions>
  reducer: (state: State<TNativeActions>, action: TNativeActions) => State<TNativeActions>
}
