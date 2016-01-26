import { isFSA } from "flux-standard-action";

const PENDING_PREFIX = "PENDING_";

export function pendingReducer(state = [], action) {
    const actionIndex = state.indexOf(action.type);
    const hasAction = actionIndex !== -1;
    if(action.type.startsWith(PENDING_PREFIX) || hasAction) {
        let nextState = state.slice();
        if(hasAction) nextState.splice(actionIndex, 1);
        else nextState.push(action.type.replace(PENDING_PREFIX, ""));
        return nextState;
    } else return state;
}

export function promiseMiddleware({ dispatch }) {
    return next => action => {
        if(isFSA(action) && action.payload instanceof Promise) {
            const { type, payload } = action;

            // Dispatch the pending action
            dispatch({ type: PENDING_PREFIX + type });

            payload.then(
                value => dispatch({ type, payload: value }), 
                error => dispatch({ type, error: true, payload: error })
            );
        } else next(action);
    }
}

export function isPending(actionType, propName = "pending") {
    return state => state[propName].indexOf(actionType) !== -1;
}