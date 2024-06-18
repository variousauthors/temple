# Temple

Just fiddling with old-school HOC based state management in more modern react.

## Motivation

I think this is bad:

```js
function Counter({ increment, decrement, count }) {
  const [count, setCount] = useState(0)
  const increment = () => setCount(count + 1)
  const decrement = () => setCount(count + 1)

  return (
    <div>
      <div>
        <button aria-label="Increment value" onClick={increment}>
          Increment
        </button>
        <span>{count}</span>
        <button aria-label="Decrement value" onClick={decrement}>
          Decrement
        </button>
      </div>
    </div>
  );
}
```

It's been years and I'm now convinced this is not great. Just the other day I encountered a situation where a pagination component from a UI library was managing its own current page in such a way that the caller had no way to reset the page, something like:

```js
function Pagination (props) {
  const [page, setPage] = useState(props.page)

  ...
}
```

throughout the codebases I've worked with I see this pattern spreading:

```js
function Pagination (props) {
  const [page, setPage] = useState(props.page)

  useEffect(() => {
    setPage(props.page)
  }, [props.page])
}
```

We don't need to do this, we can just let `Pagination` be in charge of rendering the props passed in. Let the state live in the parent. Hooks doesn't make people program this way, but hooks makes this the easiest way to do state management. Create state locally in the component, and then promote it when we need to. This is fine, but my observation is that people don't do it. Rather than promote state, they jump through hoops with `useEffect` to make their code work without promoting. It should not be a surprise, I've seen the same thing with helper functions: developers seem to either create all helpers in a shared place regardless of whether they are shared, _or_ copy/paste/re-implement functions over and over. This is because it is easier than the search/promote approach.

## Solution

Well I don't have a solution yet, but I remember HOCs being fine. They encouraged separation of concerns, encouraging state and render to live separately. This made it easy to unit test, and I think code being easy to unit test generally means the code is well structured.

So here is a first attempt at something like HOCs, but with the benefit of a decade of people improving react.

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
          <button aria-label="Increment value" onClick={increment}>
            Increment
          </button>
          <span>{count}</span>
          <button aria-label="Decrement value" onClick={decrement}>
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

The benefit is that the Counter component can be tested as a function. The slice itself can be tested separately. You can share common slices, such a modal state (open, close, isVisible, etc...) just like you can with hooks. 

This isn't a great solution though!

 - if you promote the state you end up with prop-drilling, there needs to be a way to "tap into" existing slices, something like

```js
tapInto('Counter', function CounterController () {
  // maybe some kind of master increment button in here that increments all the slices
  // for example, how would we do that?

  // or what if we wanted to tap into some particular counters and not others?
})
```

 - we'd want to be able to compose slices relevant to a particular component, for example if a component wants to control a modal _and_ a counter

```js
go(
  counterState,
  modalState,
  function BigComponent ({ increment, decrement, open, isOpen, close }) {
  }
)
```

 - when we promote state this way we encounter prop-drilling

Now, prop-drilling is clearly bad but I want to say: it's good that it's clearly bad. A problem I have with hooks is that they are not clearly bad. Well I mean, they are not bad! They can be used well and poorly and both feel great. It isn't clearly bad to declare some local state in your component: that's why people do it! It's easy, it feels good, and cool, the component feels "self-contained" and there is less boiler plate... this feels good! Something that is easy and feels good is going to happen _a lot_ where as something that feels bad and boring will find itself "solved" sooner or later. Everyone knows prop-drilling sucks because it feels like it sucks.

I want a component to be able to hook into a state slice declared somewhere else in the tree.

```js
go(
  counterState,
  modalState,
  function BigComponent ({ increment, decrement, open, isOpen, close }) {
    return (
      <button onClick={open}>Click</button>
      <Modal onClose={close}>
        <Counter />
      </Modal>
    )
  }
)

go(
  modalState('some_id'),
  Modal,
)

go(
  modalState('some_id'),
  Counter,
)

// elsewhere
<BigComponent id='some_id' />
```

But this is not deep enough yet... just thinking.
