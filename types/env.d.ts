declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_OPENWEATHER_API_KEY: string;
      EXPO_PUBLIC_AIRNOW_API_KEY: string;
      EXPO_PUBLIC_OPENAI_API_KEY: string;
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: string;
    }
  }
}

export {};