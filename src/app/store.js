import {
  configureStore as createStore,
  combineReducers,
} from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuid } from "uuid";

function createReducer(next) {
  if (!next) {
    return {};
  }

  const reducer = combineReducers({
    ...next,
  });

  return reducer;
}

let store;

function getStore() {
  if (store) {
    return store;
  }

  return configureStore();
}

export default function configureStore() {
  if (store) {
    return store;
  }

  store = createStore({
    reducer: createReducer(),
  });

  // Add a dictionary to keep track of the registered async reducers
  store.asyncReducers = {};

  // Create an inject reducer function
  // This function adds the async reducer, and creates a new combined reducer
  store.injectReducer = (key, asyncReducer) => {
    store.asyncReducers[key] = asyncReducer;
    const result = createReducer(store.asyncReducers);
    store.replaceReducer(result);
  };

  // Return the modified store
  return store;
}

export function go(stuff, component) {
  const name = component.name;
  const { initialState, ...reducers } = stuff();

  const store = getStore();
  const state = store.getState();

  if (!state[name]) {
    // we need to build up a slice manager for this type of data
    const abstractReducers = Object.entries(reducers).reduce(
      (acc, [key, entry]) => {
        return {
          ...acc,
          [key]: (state, action) => {
            const instanceState = state[action.payload.id];

            return entry(instanceState, action);
          },
        };
      },
      {}
    );

    const slice = createSlice({
      name,
      initialState: {},
      reducers: {
        ...abstractReducers,
        addInstance: (state, action) => {
          if (state[action.payload.id]) {
            return;
          }

          state[action.payload.id] = action.payload.initialState;
        },
        removeInstance: (state, action) => {
          if (!state[action.payload.id]) {
            return;
          }

          delete state[action.payload.id];
        },
      },
    });

    getStore().injectReducer(name, slice.reducer);

    const actions = slice.actions;
    console.log("actions", actions);
  }

  const next = function Next(props) {
    const [id, _] = useState(uuid());

    useEffect(() => {
      // we add another instance to the array
      store.dispatch({
        type: `${name}/addInstance`,
        payload: {
          id,
          initialState,
        },
      });
    }, [id]);

    const actionCreators = useMemo(
      () =>
        Object.keys(reducers).reduce((acc, key) => {
          return {
            ...acc,
            [key]: (payload) => ({
              type: `${name}/${key}`,
              payload: {
                ...payload,
                id,
              },
            }),
          };
        }, []),
      [id]
    );

    console.log("actions", actionCreators);

    const state = useSelector((state) => {
      if (state[name][id]) {
        return state[name][id];
      } else {
        return initialState;
      }
    });

    const dispatch = useDispatch();

    const dispatchers = Object.entries(actionCreators).reduce(
      (acc, [key, value]) => {
        return {
          ...acc,
          [key]: (payload) => dispatch(value(payload)),
        };
      },
      {}
    );

    return component({
      ...state,
      ...dispatchers,
      ...props,
    });
  };

  Object.defineProperty(next, "name", {
    value: name,
    writable: false,
  });

  return next;
}
