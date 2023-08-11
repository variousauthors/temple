import React from "react";
import { go } from "../../app/store";

/**
 * TODO
 * [] state functions should receive store and dispatch as arguments
 *    - this way you can define a component Counter but not decide how it
 *      tracks state, then in the parent you can do `go(myStateStuff, Counter)`
 *      and use knowledge of the parent state etc...
 * [] what if your component has multiple kinds of state it wants to track? Should be able
 *    to define multiple functions
 * [] multiple components of the same type should either share, or not share state, configurable
 *    - with decorators it could be
 *    - @local counterState
 *    - @global counterState
 * [] what if your component needs to fetch some async data as part of its state init?
 * [x] generally speaking the state should persist across mount/unmount, though we should
 *    provide the option not to
 *    - if you pass an id to your component it will persist across mounts/unmounts
 * */

function counterState() {
  const initialState = {
    count: 0,
  };

  const increment = (state) => {
    state.count += 1;
  };

  const decrement = (state) => {
    state.count -= 1;
  };

  return {
    initialState,
    increment,
    decrement,
  };
}

// could use decorators!
export const Counter = go(
  counterState,
  function Counter({ increment, decrement, count }) {
    return (
      <div>
        <div>
          <button aria-label="Increment value" onClick={() => increment()}>
            Increment
          </button>
          <span>{count}</span>
          <button aria-label="Decrement value" onClick={() => decrement()}>
            Decrement
          </button>
        </div>
      </div>
    );
  }
);

/** shorthand for simple cases
export const Counter = go({
    initialState: {
      count: 0
    },
    increment: (state) => {
      state.count += 1;
    },
    decrement: (state) => {
      state.count -= 1;
    }
  },
  function Counter({ increment, decrement, count }) {
    return (
      <div>
        <div>
          <button aria-label="Increment value" onClick={() => increment()}>
            Increment
          </button>
          <span>{count}</span>
          <button aria-label="Decrement value" onClick={() => decrement()}>
            Decrement
          </button>
        </div>
      </div>
    );
  }
);
*/
