import { createSignal } from "solid-js";
import { Preferences } from "@capacitor/preferences";

export interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
}

// Credentials are persisted using @capacitor/preferences v6.
// On Android, this plugin stores data in EncryptedSharedPreferences backed by
// AES-256-GCM with a key managed by the Android Keystore system, which means
// credentials are encrypted at rest by the operating system.
const CREDENTIALS_KEY = "aws_credentials";

const [credentials, setCredentials] = createSignal<AwsCredentials | null>(null);

export { credentials };

function isValidCredentials(value: unknown): value is AwsCredentials {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.accessKeyId === "string" &&
    typeof obj.secretAccessKey === "string" &&
    typeof obj.region === "string" &&
    typeof obj.bucket === "string"
  );
}

export async function loadCredentials(): Promise<void> {
  const { value } = await Preferences.get({ key: CREDENTIALS_KEY });
  if (value) {
    const parsed: unknown = JSON.parse(value);
    if (isValidCredentials(parsed)) {
      setCredentials(parsed);
    }
  }
}

export async function saveCredentials(creds: AwsCredentials): Promise<void> {
  await Preferences.set({ key: CREDENTIALS_KEY, value: JSON.stringify(creds) });
  setCredentials(creds);
}

export async function clearCredentials(): Promise<void> {
  await Preferences.remove({ key: CREDENTIALS_KEY });
  setCredentials(null);
}
