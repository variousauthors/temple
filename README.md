# Temple

Just fiddling with old-school HOC based state management in more modern react.

```js
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
```

The idea is that `go` wraps `Counter` with a use effect that sets up a redux store slice to manage the component state. It optionally removes the store slice when the component is unmounted. So for example:

```js
<Counter id="static" />
<button onClick={() => setShow(!show)}>
  {show ? "hide" : "show"}
</button>
{show ? <Counter id="dynamic" /> : null}
{show ? <Counter id="dynamic" /> : null}
{show ? <Counter /> : null}
```

On initial render there is just one store slice for the visible Counter. When the user clicks show, two more slices are created: one for the Counter with the `id` property set, and one for the Counter without the `id` property. Incrementing the Counters that share a state slice updates both. When the user clicks hide, the reduce state slice for the Counter with no `id` property is destroyed, but the slice for the two Counters that have `id` properties will persist such that when they are re-mounted later they will attach to that slice.

