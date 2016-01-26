import { promiseMiddleware, pendingReducer } from "../src/";
import assert from "assert";

const type = "FETCH";

describe("promiseMiddleware", () => {
    it("should dispatch a 'PENDING_*' action", done => {
        const dispatch = action => {
            assert.equal(action.type, `PENDING_${type}`);
            done();
        };

        promiseMiddleware({ dispatch })()({
            payload: Promise.resolve("data"),
            type
        });
    });

    it("should dispatch the resolved value", done => {
        const data = { foo: "bar" };
        let pendingPass = false;
        const dispatch = action => {
            // Skip the first dispatched PENDING_
            if(!pendingPass) return pendingPass = true;

            assert.equal(action.type, type);
            assert.deepEqual(action.payload, data);
            done();
        };

        promiseMiddleware({ dispatch })()({
            payload: Promise.resolve(data),
            type
        });
    });

    it("should dispatch the failed error", done => {
        const error = new Error()
        let pendingPass = false;
        const dispatch = action => {
            // Skip the first dispatched PENDING_
            if(!pendingPass) return pendingPass = true;

            assert(action.error);
            assert.equal(action.type, type);
            assert.equal(action.payload, error);
            done();
        };

        promiseMiddleware({ dispatch })()({
            payload: Promise.reject(error),
            type
        });
    });
});

describe("pendingReducer", () => {
    it("should add a pending flag for a 'PENDING_*' action", () => {
        const state = pendingReducer(undefined, { type: "PENDING_" + type });
        assert(state.indexOf(type) !== -1);
    });

    it("should remove the pending flag for the completed action", () => {
        const state = pendingReducer(
            pendingReducer(undefined, { type: "PENDING_" + type }),
            { type }
        );

        assert(state.length === 0);
    });
});