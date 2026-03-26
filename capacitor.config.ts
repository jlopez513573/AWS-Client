import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.awsclient.app",
  appName: "AWS Client",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
