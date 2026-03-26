import { Component } from "solid-js";
import styles from "./App.module.css";

const App: Component = () => {
  return (
    <div class={styles.app}>
      <header class={styles.header}>
        <h1>AWS Client</h1>
        <p>Cliente AWS para dispositivos móviles Android</p>
      </header>
    </div>
  );
};

export default App;
