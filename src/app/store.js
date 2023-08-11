import {
  configureStore as createStore,
  combineReducers,
} from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";

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

  const slice = createSlice({
    name,
    initialState,
    reducers,
  });

  getStore().injectReducer(name, slice.reducer);

  const actions = slice.actions;

  const next = function Next(props) {
    const state = useSelector((state) => state[name]);
    const dispatch = useDispatch();

    const dispatchers = Object.entries(actions).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: (payload) => dispatch(value(payload)),
      };
    }, {});

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
