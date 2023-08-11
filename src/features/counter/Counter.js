import React from "react";
import { go } from "../../app/store";

/**
 * TODO
 *  - what if your component has multiple kinds of state it wants to track? Should be able
 *    to define multiple functions
 *  - what if your component needs to fetch some async data as part of its state init?
 * */

export const Counter = go(
  () => {
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
