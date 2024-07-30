# react-mobile-bridge

This library was generated with [Nx](https://nx.dev).

## Running unit tests

Run `nx test react-mobile-bridge` to execute the unit tests via [Jest](https://jestjs.io).

## Motivation

Create a means of communication between a web view and its parent app client.

## Usage

### mobileBridgeFactory / MobileBridge

Call `mobileBridgeFactory` to create a bridge instance object configured to use the right OS implementation:

```tsx
const mobileBridge = mobileBridgeFactory<NativeActions, WebActions>()
```

alternatively you can also call the `create` method of `MobileBridge` class:

```tsx
const mobileBridge = MobileBridge.create()
```

Messages between the app client and the web can then be posted and received both following the redux action pattern.

To send a message to the app client use the `postMessage` method as such:

```tsx
mobileFactory.postMessage({ type: 'SOME_WEB_ACTION', payload: {} })
```

To subscribe to a message from the app client use the `subscribe` method as such:

```tsx
const unsubscribe = mobileFactory.subscribe({ type: 'SOME_NATIVE_ACTION', payload: {} })
```

The subscribe method returns an unsubscribe function which removes message listener and closes the port

Message actions need to follow the `AnyAction` format as such:

```tsx
type AnyAction = {
  type: string;
  payload: Record<string, unknown>;
}

export type ActionCreator = (payload: any) => AnyAction

// ❌ - no type returned
const actionNoType = (payload: any) => ({ value: payload })

// ❌ - wrong payload type
const actionWrongPayload = (payload: string) => ({ type: 'SOME_ACTION', value: payload }

// ✅
const actionCorrect = (payload: { value: string }) => ({ type: 'SOME_ACTION', value: payload }

```

### MobileBridgeProvider

`MobileBridgeProvider` provides a context wrapper to easily subscribe and dispatch events to the mobile bridge. You will need to pass mobile bridge as value and a reducer to keep track of subscribed actions state:

```tsx
// native-messages-reducer.tsx
const nativeMessagesReducer = (state: State, action: AnyAction) => {
  switch (action?.type) {
    case 'SOME_NATIVE_ACTION':
      return {
        ...state,
        [action.type]: action.payload,
      }
    default:
      return state
  }
}

import { nativeMessagesReducer } from './native-messages-reducer'
;<MobileBridgeProvider value={mobileBridge} reducer={nativeMessagesReducer}>
  <AppComponents />
</MobileBridgeProvider>
```

#### useSubscribeToMobileBridgeAction

This method can be used in any component or hook wrapped by the `MobileBridgeProvider` to subscribe to a native action and execute a callback when that action is broadcast from the app client bridge.
Pass the callback to execute as the first argument and the action type name as second argument.

```tsx
export const NosyComponent = () => {
  useSubscribeToMobileBridgeAction(payload => {
    if (payload?.expectedValue) {
      doSomething()
    }
  }, NATIVE_ACTION_TYPES.SOME_NATIVE_ACTION)

  ...
}
```

#### useMobileBridgeDispatch

This method can be used in any component or hook wrapped by the `MobileBridgeProvider` to retrieve the app client bridge `postMessage` method (similarly to redux `useDispatch`).

```tsx
export const NoisyComponent = () => {
  const dispatch = useMobileBridgeDispatch()

  useLayoutEffect(() => {
    dispatch(nativeActions.someWebAction())
  }, [dispatch])
}
```

### Enforcing strict action type checks

If all possible action events are known beforehand, enforcing strict action type checks using the provided generics is highly recommended.

`mobileBridgeFactory` accepts generics for each type of actions: `TNativeActions` and `TWebActions`. these need to be `Discriminating Unions` of literal types which list all possible action types.
To facilitate such implementation the helper type `TransformActionsCreatorMapObjectToActionUnion` can be used to transform an action map:

```tsx
// native-actions.tsx
export const someNativeAction = (payload = {}) => ({ type: 'SOME_NATIVE_ACTION', ...payload })

// web-actions.tsx
export const someWebAction = (payload = {}) => ({ type: 'SOME_WEB_ACTION', ...payload })

// We subscribe to these
import * as nativeActions from './native-actions'
// We post these
import * as webActions from './web-actions'

type NativeActions = TransformActionsCreatorMapObjectToActionUnion<typeof nativeActions>
type WebActions = TransformActionsCreatorMapObjectToActionUnion<typeof webactions>

const mobileFactory = mobileBridgeFactory<NativeActions, WebActions>()

// same as above:
// const mobileFactory = MobileBridge<NativeActions, WebActions>.create<NativeActions, WebActions>()
```

Calling `postMessage` or `subscribe` on an action that is not part of the set, will then result in an typescript error.

`MobileBridgeProvider` and its hooks can perform strict action checks if the correct action list actions are passed to their generic parameters:

```tsx
// native-actions.tsx
export const someNativeAction = (payload = {}) => ({ type: 'SOME_NATIVE_ACTION', ...payload })

// web-actions.tsx
export const someWebAction = (payload = {}) => ({ type: 'SOME_WEB_ACTION', ...payload })

import * as nativeActions from './native-actions'
import * as webActions from './web-actions'

type TNativeActions = TransformActionsCreatorMapObjectToActionUnion<typeof nativeActions>
type TWebActions = TransformActionsCreatorMapObjectToActionUnion<typeof webActions>
;<MobileBridgeProvider<TNativeActions, TWebActions> value={mobileBridge} reducer={nativeMessagesReducer}>
  <AppComponents />
</MobileBridgeProvider>
```

Optionally we can also pass a list of all the web actions to `useMobileBridgeDispatch`

```tsx
type TWebActions = TransformActionsCreatorMapObjectToActionUnion<typeof webActions>

const dispatch = useMobileBridgeDispatch<TWebActions>()
```

And the name of the native action we are subscribing to plus the list of all the native actions to `useSubscribeToMobileBridgeAction`

```tsx
type TNativeActions = TransformActionsCreatorMapObjectToActionUnion<typeof webActions>

useSubscribeToMobileBridgeAction<TWebActions, typeof WEB_ACTION_TYPES.SOME_WEB_ACTION>(
  cb,
  WEB_ACTION_TYPES.SOME_WEB_ACTION
)
```
