import logo from "./logo.svg";
import "./App.css";
import { Provider } from "react-redux";
import { Counter } from "./features/counter/Counter";
import configureStore from "./app/store";
import { useState } from "react";

const store = configureStore();

function App() {
  const [show, setShow] = useState(true);

  return (
    <Provider store={store}>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <Counter id="static" />
          <button onClick={() => setShow(!show)}>
            {show ? "hide" : "show"}
          </button>
          {show ? <Counter id="dynamic" /> : null}
          {show ? <Counter /> : null}
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    </Provider>
  );
}

export default App;
