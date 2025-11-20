import 'dotenv/config';

export default ({ config }) => {
  return {
    ...config,
    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            abiFilters: ["arm64-v8a"]
          }
        }
      ]
    ],
    extra: {
      googleApiKey: process.env.GOOGLE_API_KEY,
    }
  };
};