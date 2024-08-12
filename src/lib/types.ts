export type Action<Type, Payload> = {
  type: Type
  payload: Payload
}

export type AnyActionPayload = Record<string, unknown>

export type AnyAction = Action<string, AnyActionPayload>

export interface BridgeEventHandler<TActions> {
  (action: TActions): void
}

export type ActionCreator<TPayload = AnyActionPayload> = (
  payload: TPayload extends AnyActionPayload ? any : never
) => AnyAction

// WRITTEN BY ANOTHER DEVELOPER
export type TransformActionsCreatorMapObjectToActionUnion<TActions> = TActions[keyof TActions] extends ActionCreator
  ? TActions[keyof TActions] extends ActionCreator<ReturnType<TActions[keyof TActions]>['payload']>
    ? ReturnType<TActions[keyof TActions]>
    : never
  : never
