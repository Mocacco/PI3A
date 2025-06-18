import Constants from "expo-constants";

// Expo CLI em modo LAN fornece hostUri dentro de expoConfig
const hostUri = Constants.expoConfig?.hostUri || Constants.expoConfig?.hostUri;

// Se quiser adicionar fallback:
const ip = hostUri?.split(":")[0] || "localhost";

export default `http://${ip}`;