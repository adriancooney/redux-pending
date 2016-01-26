# redux-pending
I find working asynchronously in Redux pretty frustrating. Too many things to do and actions to handle. This is where `redux-pending` comes in. It's a promise middleware that you add to your store and will handle resolving the promises and dispatching pending actions. It's based heavily around [`redux-promise`](http://github.com/acdlite/redux-promise).

## Features
* Uses Flux Standard Actions.
* Handles pending state of promises and emits actions to handle pending promises. 

## Installation
Install via npm:

    $ npm install --save redux-pending

## Usage 
First off, we add include our `promiseMiddleware` into our store's middleware. We also add the `pendingReducer` to our reducers. It's important that the reducer is under the root `pending` property in the state (but is configurable, see `isPending` method).

```js
import { applyMiddleware, createStore, combineReducers } from "redux";
import { connect } from "react-redux";
import { promiseMiddleware, pendingReducer, isPending } from "redux-pending";

// Add the promise middleware to your store
const finalCreateStore = applyMiddleware(promiseMiddleware)(createStore);

const reducers = combineReducers({
    // Add your `pending` reducer. Important the name is `pending` otherwise, see the `isPending` method.
    pending: pendingReducer,

    todos: (state = { todos: [] }, action) => {
        switch(action.type) {
            case 'FETCH_TODOS':
                if(action.error) {
                    // Uh-oh, the promise failed
                    // console.log(action.payload)
                }

                return action.payload; // Our todos loaded from the server

            default:
                return state;
        }
    }
});

// And create our store with our reducer
const store = finalCreateStore(reducers);
```

Now that we have our middleware and reducer in place, we need an action that dispatches a promise. Here we have an example that dispatches an `API.fetchTodos` promise as a Flux Standard Action which will fetch the Todos from the server. Two actions are dispatched here. An action with the type plus `_PENDING` appended e.g. `PENDING_FETCH_TODOS` immediately to signify the promise has started execution and is waiting to return. The next is `FETCH_TODOS` when the promise's execution completes with the `payload` as the return value. If the promise fails, the `payload` will be the error caught and an `error` flag will be added to the action. See [Flux Standard Actions](https://github.com/acdlite/flux-standard-action).

```js
const FETCH_TODOS = 'FETCH_TODOS';

const fetchTodos = () => {
    type: FETCH_TODOS,
    payload: pending(API.fetchTodos())
};
```

Now we move onto our component where we connect our Redux state. We want our component to display a `Loading` screen if our todos are loading from the server. We do that by using the handy selector function `isPending` which will determine from our `pending` state the status of our dispatched promise. We connect that selector to our component in the `mapStateToProps` argument in the `connect` function from the `react-redux` bindings under the prop `todosLoading`. This flag will toggle according to the status of the dispatched promise.

```js
class App extends Component {
    componentWillMount() {
        // Dispatch our promise action
        this.props.fetchTodos();
    }

    render() {
        if(this.props.todosLoading) {
            return <Loading />;
        } else {
            if(this.props.todos.length) {
                return <TodoList todos={this.props.todos} />
            } else {
                return <EmptyList />
            }
        }
    }
}

// Now we connect our state and actions to the component
connect(state => ({
    // Add a prop which tells our component if our promise is pending or not.
    // We get our selector returned from `isPending` and we pass in our state.
    todosLoading: isPending(FETCH_TODOS)(state)
}), {
    fetchTodos
})(App);
```

Finally, if you're that way inclined, `redux-pending` works particularly well with [`redux-actions`](http://github.com/acdlite/redux-actions).

```js
const FETCH_TODOS = 'FETCH_TODOS';

// Our action creator
const fetchTodos = createAction(FETCH_TODOS, API.fetchTodos);

// Our action handler
handleAction(FETCH_TODOS, {
    next(state, action) { ... }, // Promise succeeded
    throw(state, action) { ... } // Promise failed
});
```

## API
The following are exported from `redux-pending`.

#### `isPending( actionType:String [, propName:String ] )`
Returns selector function that when passed the current state will return whether or not the promise for an action of type `actionType` is currently executing or not. The `propName` parameter allows you to set the name of the property on the state that your `pendingReducer` is stored under. Defaults to `pending`.

Example:

```js
isPending('FETCH')(state)
```

#### `promiseMiddleware`
The promise middleware function for use with Redux's `combineMiddleware` function.

#### `pendingReducer`
The reducer to be added to your store via `combineReducers`.

## Credits & License
Author: Adrian Cooney <cooney.adrian@gmail.com>

License: MIT