import { Component, createSignal } from "solid-js";
import Box from "@suid/material/Box";
import Button from "@suid/material/Button";
import TextField from "@suid/material/TextField";
import Typography from "@suid/material/Typography";
import Alert from "@suid/material/Alert";
import Paper from "@suid/material/Paper";
import Stack from "@suid/material/Stack";
import type { AwsCredentials } from "../store/credentials";
import { saveCredentials } from "../store/credentials";

interface Props {
  initial?: AwsCredentials | null;
}

const CredentialsForm: Component<Props> = (props) => {
  const [accessKeyId, setAccessKeyId] = createSignal(
    props.initial?.accessKeyId ?? ""
  );
  const [secretAccessKey, setSecretAccessKey] = createSignal(
    props.initial?.secretAccessKey ?? ""
  );
  const [region, setRegion] = createSignal(props.initial?.region ?? "");
  const [bucket, setBucket] = createSignal(props.initial?.bucket ?? "");
  const [error, setError] = createSignal("");
  const [saving, setSaving] = createSignal(false);

  const handleSave = async () => {
    if (!accessKeyId() || !secretAccessKey() || !region() || !bucket()) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await saveCredentials({
        accessKeyId: accessKeyId(),
        secretAccessKey: secretAccessKey(),
        region: region(),
        bucket: bucket(),
      });
    } catch {
      setError("Error al guardar las credenciales.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 480, mx: "auto" }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Configurar credenciales AWS
        </Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Tus credenciales se guardarán en este dispositivo. Eres responsable de
          su seguridad. No compartas este dispositivo con personas no
          autorizadas.
        </Alert>
        <Stack spacing={2}>
          <TextField
            label="Access Key ID"
            value={accessKeyId()}
            onChange={(e) => setAccessKeyId(e.target.value)}
            fullWidth
            autoComplete="off"
          />
          <TextField
            label="Secret Access Key"
            type="password"
            value={secretAccessKey()}
            onChange={(e) => setSecretAccessKey(e.target.value)}
            fullWidth
            autoComplete="off"
          />
          <TextField
            label="Región (e.g. us-east-1)"
            value={region()}
            onChange={(e) => setRegion(e.target.value)}
            fullWidth
          />
          <TextField
            label="Nombre del bucket"
            value={bucket()}
            onChange={(e) => setBucket(e.target.value)}
            fullWidth
          />
          {error() && <Alert severity="error">{error()}</Alert>}
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving()}
            fullWidth
          >
            {saving() ? "Guardando…" : "Guardar y conectar"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default CredentialsForm;
