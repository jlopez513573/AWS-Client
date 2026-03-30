import { Component, onMount, Show } from "solid-js";
import { ThemeProvider, createTheme } from "@suid/material/styles";
import CssBaseline from "@suid/material/CssBaseline";
import { credentials, loadCredentials } from "./store/credentials";
import CredentialsForm from "./components/CredentialsForm";
import S3Browser from "./components/S3Browser";

const theme = createTheme({
  palette: {
    primary: { main: "#0097A7" },
    secondary: { main: "#FFFFFF" },
  },
});

const App: Component = () => {
  onMount(loadCredentials);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Show
        when={credentials()}
        fallback={<CredentialsForm initial={credentials()} />}
      >
        {(creds) => <S3Browser credentials={creds()} />}
      </Show>
    </ThemeProvider>
  );
};

export default App;
